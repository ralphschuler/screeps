/**
 * Link Manager
 *
 * Handles automated link operations:
 * - Energy transfer from source links to controller/storage links
 * - Link balancing and cooldown management
 * - Integration with source meta for optimal routing
 *
 * Addresses Issue: Link balancing automation
 * 
 * Link Strategy (from ROADMAP.md):
 * - Links are used for fast energy transfer (RCL5+)
 * - Source links send to controller/storage links
 * - Reduces hauler workload for long-distance transfers
 * - Each link has 800 energy capacity and cooldown after transfer
 */

import { logger } from "../core/logger";
import { ProcessPriority } from "../core/kernel";
import { MediumFrequencyProcess, ProcessClass } from "../core/processDecorators";

/**
 * Link manager configuration
 */
export interface LinkManagerConfig {
  /** Minimum bucket to run link operations */
  minBucket: number;
  /** Minimum energy in source link before transfer */
  minSourceLinkEnergy: number;
  /** Maximum energy to keep in controller link */
  controllerLinkMaxEnergy: number;
  /** Energy threshold to trigger link transfer */
  transferThreshold: number;
  /** Reserve energy in storage link for emergencies */
  storageLinkReserve: number;
}

const DEFAULT_CONFIG: LinkManagerConfig = {
  minBucket: 2000, // Align with standard medium frequency processes
  minSourceLinkEnergy: 400, // Transfer when source link is at least half full
  controllerLinkMaxEnergy: 700, // Keep controller link nearly full
  transferThreshold: 100, // Min energy to justify transfer
  storageLinkReserve: 100 // Keep some energy in storage link for flexibility
};

/**
 * Link roles in the network
 */
enum LinkRole {
  SOURCE = "source",       // Near energy sources
  CONTROLLER = "controller", // Near controller for upgraders
  STORAGE = "storage",      // Near storage for general distribution
  UNKNOWN = "unknown"
}

/**
 * Link metadata
 */
interface LinkMeta {
  link: StructureLink;
  role: LinkRole;
  priority: number; // Higher priority links get energy first
}

/**
 * Link Manager Class
 */
@ProcessClass()
export class LinkManager {
  private config: LinkManagerConfig;

  public constructor(config: Partial<LinkManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main link tick - runs periodically
   * Registered as kernel process via decorator
   */
  @MediumFrequencyProcess("link:manager", "Link Manager", {
    priority: ProcessPriority.MEDIUM,
    interval: 5, // Run every 5 ticks for responsive link management
    minBucket: 2000, // Use standard medium frequency minBucket
    cpuBudget: 0.05
  })
  public run(): void {
    if (Game.cpu.bucket < this.config.minBucket) {
      return;
    }

    // Process links in all owned rooms with RCL >= 5
    const roomsWithLinks = Object.values(Game.rooms).filter(
      r => r.controller?.my && r.controller.level >= 5
    );

    for (const room of roomsWithLinks) {
      this.processRoomLinks(room);
    }
  }

  /**
   * Process links in a single room
   */
  private processRoomLinks(room: Room): void {
    const links = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_LINK
    }) as StructureLink[];

    if (links.length < 2) {
      // Need at least 2 links to transfer
      return;
    }

    // Classify links by role
    const linkMetas = this.classifyLinks(room, links);

    // Separate links by role
    const sourceLinks = linkMetas.filter(m => m.role === LinkRole.SOURCE);
    const controllerLinks = linkMetas.filter(m => m.role === LinkRole.CONTROLLER);
    const storageLinks = linkMetas.filter(m => m.role === LinkRole.STORAGE);

    // Execute transfers: source links → controller/storage links
    this.executeTransfers(room, sourceLinks, controllerLinks, storageLinks);
  }

  /**
   * Classify links by their role in the room
   */
  private classifyLinks(room: Room, links: StructureLink[]): LinkMeta[] {
    const controller = room.controller;
    const storage = room.storage;
    const sources = room.find(FIND_SOURCES);

    return links.map(link => {
      // Check if near controller (within range 2)
      if (controller && link.pos.getRangeTo(controller) <= 2) {
        return {
          link,
          role: LinkRole.CONTROLLER,
          priority: 100 // Highest priority - upgraders need energy
        };
      }

      // Check if near storage (within range 2)
      if (storage && link.pos.getRangeTo(storage) <= 2) {
        return {
          link,
          role: LinkRole.STORAGE,
          priority: 50 // Medium priority - general distribution
        };
      }

      // Check if near any source (within range 2)
      for (const source of sources) {
        if (link.pos.getRangeTo(source) <= 2) {
          return {
            link,
            role: LinkRole.SOURCE,
            priority: 10 // Low priority - these are senders, not receivers
          };
        }
      }

      // Unknown role - might be a transfer link or unused
      return {
        link,
        role: LinkRole.UNKNOWN,
        priority: 25
      };
    });
  }

  /**
   * Execute energy transfers between links
   */
  private executeTransfers(
    room: Room,
    sourceLinks: LinkMeta[],
    controllerLinks: LinkMeta[],
    storageLinks: LinkMeta[]
  ): void {
    // Sort source links by energy (highest first - they want to send)
    const readySourceLinks = sourceLinks
      .filter(m => 
        m.link.store.getUsedCapacity(RESOURCE_ENERGY) >= this.config.minSourceLinkEnergy &&
        m.link.cooldown === 0
      )
      .sort((a, b) => 
        b.link.store.getUsedCapacity(RESOURCE_ENERGY) - 
        a.link.store.getUsedCapacity(RESOURCE_ENERGY)
      );

    if (readySourceLinks.length === 0) {
      return; // No source links ready to send
    }

    // Collect all receiver links and sort by priority
    const receiverLinks = [...controllerLinks, ...storageLinks]
      .filter(m => m.link.store.getFreeCapacity(RESOURCE_ENERGY) > this.config.transferThreshold)
      .sort((a, b) => b.priority - a.priority);

    if (receiverLinks.length === 0) {
      return; // No receivers need energy
    }

    // Execute transfers
    for (const sourceMeta of readySourceLinks) {
      if (sourceMeta.link.cooldown > 0) continue;

      // Find best receiver
      let bestReceiver: LinkMeta | null = null;

      // Prioritize controller link if it needs energy
      for (const receiver of receiverLinks) {
        if (receiver.link.store.getFreeCapacity(RESOURCE_ENERGY) < this.config.transferThreshold) {
          continue; // Not enough space
        }

        // Controller link gets priority if it's below threshold
        if (receiver.role === LinkRole.CONTROLLER && 
            receiver.link.store.getUsedCapacity(RESOURCE_ENERGY) < this.config.controllerLinkMaxEnergy) {
          bestReceiver = receiver;
          break;
        }

        // Storage link gets priority if controller is satisfied
        if (receiver.role === LinkRole.STORAGE) {
          // Only fill storage link if it's significantly depleted
          if (receiver.link.store.getUsedCapacity(RESOURCE_ENERGY) < this.config.storageLinkReserve) {
            bestReceiver = receiver;
            break; // Found suitable storage link
          }
          continue; // Storage link has enough, skip it
        }

        // Any other receiver as fallback
        if (!bestReceiver && receiver.link.store.getFreeCapacity(RESOURCE_ENERGY) > this.config.transferThreshold) {
          bestReceiver = receiver;
        }
      }

      if (!bestReceiver) continue;

      // Execute transfer
      const amount = sourceMeta.link.store.getUsedCapacity(RESOURCE_ENERGY);
      const result = sourceMeta.link.transferEnergy(bestReceiver.link, amount);

      if (result === OK) {
        logger.debug(
          `Link transfer: ${amount} energy from ${sourceMeta.link.pos} to ${bestReceiver.link.pos} (${bestReceiver.role})`,
          { subsystem: "Link", room: room.name }
        );
      } else if (result !== ERR_TIRED && result !== ERR_FULL) {
        logger.warn(
          `Link transfer failed: ${result} from ${sourceMeta.link.pos} to ${bestReceiver.link.pos}`,
          { subsystem: "Link", room: room.name }
        );
      }
    }
  }

  /**
   * Get link role for a specific link (utility method)
   */
  public getLinkRole(link: StructureLink): LinkRole {
    const room = link.room;
    const controller = room.controller;
    const storage = room.storage;
    const sources = room.find(FIND_SOURCES);

    if (controller && link.pos.getRangeTo(controller) <= 2) {
      return LinkRole.CONTROLLER;
    }

    if (storage && link.pos.getRangeTo(storage) <= 2) {
      return LinkRole.STORAGE;
    }

    for (const source of sources) {
      if (link.pos.getRangeTo(source) <= 2) {
        return LinkRole.SOURCE;
      }
    }

    return LinkRole.UNKNOWN;
  }

  /**
   * Check if a room has a functional link network
   */
  public hasLinkNetwork(room: Room): boolean {
    if (!room.controller?.my || room.controller.level < 5) {
      return false;
    }

    const links = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_LINK
    }) as StructureLink[];

    if (links.length < 2) {
      return false;
    }

    const linkMetas = this.classifyLinks(room, links);
    const hasSource = linkMetas.some(m => m.role === LinkRole.SOURCE);
    const hasReceiver = linkMetas.some(m => 
      m.role === LinkRole.CONTROLLER || m.role === LinkRole.STORAGE
    );

    return hasSource && hasReceiver;
  }
}

/**
 * Global link manager instance
 */
export const linkManager = new LinkManager();
