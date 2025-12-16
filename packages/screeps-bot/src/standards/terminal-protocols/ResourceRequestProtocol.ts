/**
 * Terminal Protocol: Resource Request
 * Request and fulfill resource transfers between allies
 * Based on: https://github.com/screepers/screepers-standards/blob/master/terminal_protocols/resource_request.md
 */

import { ResourceRequest, ResourceResponse } from "../types";
import { SS2TerminalComms } from "../SS2TerminalComms";
import { createLogger } from "../../core/logger";

const logger = createLogger("ResourceRequestProtocol");

export class ResourceRequestProtocol {
  private static readonly PROTOCOL_NAME = "resource_request";
  private static pendingRequests: Map<string, ResourceRequest> = new Map();
  private static requestIdCounter = 0;

  /**
   * Send resource request
   * @param terminal Terminal to send from
   * @param targetRoom Target room
   * @param resource Resource type
   * @param amount Amount requested
   * @param toRoom Destination room
   * @param priority Priority (1-10)
   * @returns Request ID
   */
  public static sendRequest(
    terminal: StructureTerminal,
    targetRoom: string,
    resource: ResourceConstant,
    amount: number,
    toRoom: string,
    priority: number = 5
  ): string {
    const requestId = this.generateRequestId();
    
    const request: ResourceRequest = {
      type: "resource_request",
      resource: resource,
      amount: amount,
      toRoom: toRoom,
      priority: priority,
    };

    const message = SS2TerminalComms.formatJSON({
      ...request,
      requestId: requestId,
    });

    this.pendingRequests.set(requestId, request);

    SS2TerminalComms.sendMessage(
      terminal,
      targetRoom,
      RESOURCE_ENERGY,
      10,
      message
    );

    return requestId;
  }

  /**
   * Send resource response
   * @param terminal Terminal to send from
   * @param targetRoom Target room
   * @param requestId Request ID
   * @param accepted Whether request is accepted
   * @param estimatedTicks Estimated delivery time
   * @returns Success status
   */
  public static sendResponse(
    terminal: StructureTerminal,
    targetRoom: string,
    requestId: string,
    accepted: boolean,
    estimatedTicks?: number
  ): ScreepsReturnCode {
    const response: ResourceResponse = {
      type: "resource_response",
      requestId: requestId,
      accepted: accepted,
      estimatedTicks: estimatedTicks,
    };

    const message = SS2TerminalComms.formatJSON(response);

    return SS2TerminalComms.sendMessage(
      terminal,
      targetRoom,
      RESOURCE_ENERGY,
      10,
      message
    );
  }

  /**
   * Process incoming resource request
   * @param sender Sender username
   * @param message Message content
   * @returns True if message was a resource request
   */
  public static processMessage(
    sender: string,
    message: string
  ): boolean {
    const data = SS2TerminalComms.parseJSON(message);
    if (!data) {
      return false;
    }

    if (data.type === "resource_request") {
      this.handleResourceRequest(sender, data as ResourceRequest & { requestId: string });
      return true;
    } else if (data.type === "resource_response") {
      this.handleResourceResponse(sender, data as ResourceResponse);
      return true;
    }

    return false;
  }

  /**
   * Handle incoming resource request
   * @param sender Sender username
   * @param request Request data
   */
  private static handleResourceRequest(
    sender: string,
    request: ResourceRequest & { requestId: string }
  ): void {
    console.log(
      `[ResourceRequest] Request from ${sender}: ${request.amount} ${request.resource} to ${request.toRoom} (priority ${request.priority})`
    );

    // Check if we can fulfill the request
    const canFulfill = this.canFulfillRequest(request);
    
    if (!canFulfill) {
      console.log(`[ResourceRequest] Cannot fulfill request ${request.requestId}`);
      return;
    }

    // Find best terminal to send from
    const terminal = this.findBestTerminal(request.resource, request.amount);
    if (!terminal) {
      console.log(`[ResourceRequest] No suitable terminal found`);
      return;
    }

    // Calculate estimated delivery time
    const estimatedTicks = Game.map.getRoomLinearDistance(
      terminal.room.name,
      request.toRoom
    ) * 50;

    // Send acceptance response
    this.sendResponse(
      terminal,
      request.toRoom,
      request.requestId,
      true,
      estimatedTicks
    );

    // Queue the actual resource transfer
    this.queueTransfer(terminal, request);
  }

  /**
   * Handle incoming resource response
   * @param sender Sender username
   * @param response Response data
   */
  private static handleResourceResponse(
    sender: string,
    response: ResourceResponse
  ): void {
    console.log(
      `[ResourceRequest] Response from ${sender} for ${response.requestId}: ${response.accepted ? "accepted" : "rejected"}`
    );

    if (response.accepted && response.estimatedTicks) {
      console.log(`[ResourceRequest] Estimated delivery: ${response.estimatedTicks} ticks`);
    }

    // Clean up pending request
    this.pendingRequests.delete(response.requestId);
  }

  /**
   * Check if we can fulfill a resource request
   * @param request Request to check
   * @returns True if we can fulfill
   */
  private static canFulfillRequest(request: ResourceRequest): boolean {
    // Check if we have enough of the resource
    let totalAmount = 0;
    
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my) continue;
      
      if (room.storage) {
        totalAmount += room.storage.store[request.resource] || 0;
      }
      if (room.terminal) {
        totalAmount += room.terminal.store[request.resource] || 0;
      }
    }

    // Keep some buffer - only fulfill if we have 2x the requested amount
    return totalAmount >= request.amount * 2;
  }

  /**
   * Find best terminal to send resources from
   * @param resource Resource type
   * @param amount Amount needed
   * @returns Terminal or null
   */
  private static findBestTerminal(
    resource: ResourceConstant,
    amount: number
  ): StructureTerminal | null {
    let bestTerminal: StructureTerminal | null = null;
    let bestAmount = 0;

    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my || !room.terminal?.my) continue;

      const available = room.terminal.store[resource] || 0;
      if (available >= amount && available > bestAmount) {
        bestTerminal = room.terminal;
        bestAmount = available;
      }
    }

    return bestTerminal;
  }

  /**
   * Queue resource transfer
   * @param terminal Terminal to send from
   * @param request Request data
   */
  private static queueTransfer(
    terminal: StructureTerminal,
    request: ResourceRequest
  ): void {
    // Store in memory for next tick execution
    if (!Memory.resourceTransfers) {
      Memory.resourceTransfers = [];
    }

    Memory.resourceTransfers.push({
      from: terminal.room.name,
      to: request.toRoom,
      resource: request.resource,
      amount: request.amount,
      scheduledTick: Game.time + 1,
    });
  }

  /**
   * Generate unique request ID
   * @returns Request ID
   */
  private static generateRequestId(): string {
    return `req_${Game.time}_${this.requestIdCounter++}`;
  }

  /**
   * Process queued resource transfers
   * Execute transfers scheduled for this tick
   */
  public static processQueuedTransfers(): void {
    if (!Memory.resourceTransfers || Memory.resourceTransfers.length === 0) {
      return;
    }

    const transfers = Memory.resourceTransfers;
    const remaining = [];

    for (const transfer of transfers) {
      // Check if scheduled for this tick
      if (transfer.scheduledTick > Game.time) {
        remaining.push(transfer);
        continue;
      }

      // Find the terminal
      const room = Game.rooms[transfer.from];
      if (!room || !room.terminal) {
        logger.warn(`Transfer failed: room ${transfer.from} has no terminal`, {
          meta: { transfer }
        });
        // Retry later if terminal might become available
        if (Game.time - transfer.scheduledTick < 10) {
          remaining.push({
            ...transfer,
            scheduledTick: Game.time + 5,
          });
        }
        continue;
      }

      // Execute transfer
      const result = room.terminal.send(
        transfer.resource,
        transfer.amount,
        transfer.to
      );

      if (result === OK) {
        logger.info(
          `Sent ${transfer.amount} ${transfer.resource} to ${transfer.to}`,
          { meta: { transfer } }
        );
      } else if (result === ERR_NOT_ENOUGH_RESOURCES || result === ERR_TIRED) {
        // Retry on next tick for recoverable errors
        logger.warn(
          `Transfer failed with code ${result}: ${transfer.amount} ${transfer.resource} to ${transfer.to} - retrying`,
          { meta: { transfer, result } }
        );
        remaining.push({
          ...transfer,
          scheduledTick: Game.time + 1,
        });
      } else {
        // Log permanent failures but don't retry
        logger.error(
          `Transfer permanently failed with code ${result}: ${transfer.amount} ${transfer.resource} to ${transfer.to}`,
          { meta: { transfer, result } }
        );
      }
    }

    Memory.resourceTransfers = remaining;
  }

  /**
   * Auto-fulfill ally resource requests based on configuration
   * @param config Fulfillment configuration
   * 
   * NOTE: This is a placeholder for future integration with SS2TerminalComms.
   * Full implementation requires:
   * 1. Integration with SS2TerminalComms message processing
   * 2. Alliance configuration for allowed allies
   * 3. Resource availability checks
   * 4. Transfer cost calculations
   * 
   * For now, use processQueuedTransfers() to execute manually queued transfers.
   */
  public static autoFulfillRequests(config: {
    allyUsernames: string[];
    maxTransfersPerTick?: number;
    minReserveRatio?: number;
  }): void {
    // Process queued transfers from previous requests
    this.processQueuedTransfers();
    
    // TODO: Implement automatic ally request processing
    // This would require:
    // 1. Reading incoming SS2 messages via SS2TerminalComms.processIncomingTransactions()
    // 2. Filtering for messages from config.allyUsernames
    // 3. Parsing resource requests using processMessage()
    // 4. Auto-approving requests based on availability and reserve ratios
    // 5. Queuing approved transfers
    //
    // Example workflow:
    // const messages = SS2TerminalComms.processIncomingTransactions();
    // for (const { sender, message } of messages) {
    //   if (!config.allyUsernames.includes(sender)) continue;
    //   if (this.processMessage(sender, message)) {
    //     // Request was handled by handleResourceRequest()
    //     // which already queues the transfer if approved
    //   }
    // }
  }
}
