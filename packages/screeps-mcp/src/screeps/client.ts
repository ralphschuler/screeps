/**
 * Screeps API client integration
 */

import type {
  ScreepsConfig,
  RoomData,
  CreepData,
  SpawnData,
  StatsData,
  MemoryResult,
  ConsoleResult
} from "../types.js";

const DEFAULT_HOST = "screeps.com";
const DEFAULT_PROTOCOL: "http" | "https" = "https";
const DEFAULT_PORT = 443;
const DEFAULT_SHARD = "shard3";

function parseHostParts(rawHost?: string): { host?: string; port?: number; protocol?: "http" | "https" } {
  const trimmed = rawHost?.trim();

  if (!trimmed || trimmed.includes("${")) {
    return {};
  }

  if (trimmed.includes("://")) {
    try {
      const parsed = new URL(trimmed);
      return {
        host: parsed.hostname || undefined,
        port: parsed.port ? Number(parsed.port) : undefined,
        protocol: parsed.protocol === "http:" ? "http" : parsed.protocol === "https:" ? "https" : undefined
      };
    } catch {
      return {};
    }
  }

  const portMatch = trimmed.match(/^(?<host>[^:]+):(?<port>\d+)$/);
  if (portMatch?.groups) {
    return {
      host: portMatch.groups.host,
      port: Number(portMatch.groups.port)
    };
  }

  return { host: trimmed };
}

function normalizeProtocol(protocol?: string): "http" | "https" {
  if (protocol === "http" || protocol === "https") {
    return protocol;
  }
  return DEFAULT_PROTOCOL;
}

function normalizePort(port: number | undefined, fallbackProtocol: "http" | "https"): number {
  if (typeof port === "number" && Number.isFinite(port) && port > 0) {
    return port;
  }
  return fallbackProtocol === "http" ? 80 : DEFAULT_PORT;
}

function normalizeHost(host?: string): string {
  const trimmed = host?.trim();
  if (!trimmed) {
    return DEFAULT_HOST;
  }

  const cleaned = trimmed.replace(/^(https?:\/\/)/i, "").replace(/\/+$/, "");
  return cleaned || DEFAULT_HOST;
}

/**
 * Screeps API client for MCP server integration
 */
export class ScreepsClient {
  private config: ScreepsConfig;
  private api: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  public constructor(config: ScreepsConfig) {
    const hostParts = parseHostParts(config.host);
    const protocol = normalizeProtocol(config.protocol ?? hostParts.protocol);

    this.config = {
      token: config.token,
      email: config.email,
      password: config.password,
      host: normalizeHost(hostParts.host ?? (config.host && !config.host.includes("${") ? config.host : undefined)),
      port: normalizePort(config.port ?? hostParts.port, protocol),
      protocol,
      shard: (config.shard?.trim() || DEFAULT_SHARD) as string
    };
  }

  /**
   * Initialize the Screeps API connection
   */
  public async connect(): Promise<void> {
    // Dynamic import to avoid issues with ESM
    const { ScreepsAPI } = await import("screeps-api");

    // Check for authentication credentials
    if (!this.config.token && !(this.config.email && this.config.password)) {
      throw new Error("Authentication credentials required (token or email/password)");
    }

    const baseUrl = `${this.config.protocol}://${this.config.host}:${this.config.port}/`;
    try {
      // Validate we can form a valid URL before constructing the API client

      new URL(baseUrl);
    } catch {
      throw new Error(
        `Invalid Screeps server URL '${baseUrl}'. Check SCREEPS_HOST, SCREEPS_PORT, and SCREEPS_PROTOCOL.`
      );
    }

    // Initialize the API with configuration
    this.api = new ScreepsAPI({
      token: this.config.token,
      email: this.config.email,
      password: this.config.password,
      hostname: this.config.host,
      protocol: this.config.protocol,
      port: this.config.port,
      path: "/"
    });

    // For email/password authentication, call auth() to perform login
    // For token authentication, the token is already set in the constructor
    if (!this.config.token && this.config.email && this.config.password) {
      await this.api.auth(this.config.email, this.config.password);
    }
  }

  /**
   * Get room information
   */
  public async getRooms(): Promise<RoomData[]> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    const shard = this.config.shard ?? "shard3";
    const response = await this.api.memory.get("rooms", shard);

    if (!response || !response.data) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.entries(response.data).map(([name, data]: [string, any]) => ({
      name,
      controller: data.controller,
      energyAvailable: data.energyAvailable ?? 0,
      energyCapacityAvailable: data.energyCapacityAvailable ?? 0
    }));
  }

  /**
   * Get creep information
   */
  public async getCreeps(): Promise<CreepData[]> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    const shard = this.config.shard ?? "shard3";
    const response = await this.api.memory.get("creeps", shard);

    if (!response || !response.data) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.entries(response.data).map(([name, data]: [string, any]) => ({
      name,
      role: data.role,
      room: data.room,
      hits: data.hits ?? 0,
      hitsMax: data.hitsMax ?? 0,
      ticksToLive: data.ticksToLive
    }));
  }

  /**
   * Get spawn information
   */
  public async getSpawns(): Promise<SpawnData[]> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    const shard = this.config.shard ?? "shard3";
    const response = await this.api.memory.get("spawns", shard);

    if (!response || !response.data) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.entries(response.data).map(([name, data]: [string, any]) => ({
      name,
      room: data.room,
      spawning: data.spawning,
      energy: data.energy ?? 0,
      energyCapacity: data.energyCapacity ?? 0
    }));
  }

  /**
   * Get game statistics
   */
  public async getStats(): Promise<StatsData> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    const shard = this.config.shard ?? "shard3";
    const response = await this.api.memory.get("stats", shard);

    const data = response?.data ?? {};

    return {
      cpu: {
        used: data.cpu?.used ?? 0,
        limit: data.cpu?.limit ?? 0,
        bucket: data.cpu?.bucket
      },
      gcl: data.gcl,
      rooms: data.rooms ?? 0,
      creeps: data.creeps ?? 0
    };
  }

  /**
   * Get memory value at path
   */
  public async getMemory(path: string): Promise<MemoryResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    const shard = this.config.shard ?? "shard3";
    try {
      const response = await this.api.memory.get(path, shard);

      // Screeps returns a 200 with a string error for invalid paths
      if (response?.data === "Incorrect memory path") {
        return {
          success: false,
          path,
          error: "Incorrect memory path"
        };
      }

      return {
        success: true,
        path,
        value: response?.data
      };
    } catch (error) {
      console.error(`❌ Failed to get memory at path: ${path}`);
      if (error instanceof Error) {
        console.error(`   Error: ${error.message}`);
        // Log response data if available (for API errors)
        const apiError = error as Error & { response?: { status?: number; data?: unknown } };
        if (apiError.response) {
          console.error(`   Status: ${apiError.response.status}`);
          console.error(`   Response data:`, apiError.response.data);
        }
      }
      return {
        success: false,
        path,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Set memory value at path (with safety checks)
   */
  public async setMemory(path: string, value: unknown): Promise<MemoryResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    // Safety check: prevent modifying critical system paths
    const pathParts = path.split(".");
    const criticalPaths = ["__proto__", "constructor", "prototype"];
    if (pathParts.some(part => criticalPaths.includes(part))) {
      return {
        success: false,
        path,
        error: "Cannot modify critical system paths"
      };
    }

    try {
      const shard = this.config.shard ?? "shard3";
      const shardPath = `_shard_${shard}`;
      const response = await this.api.memory.set(shardPath, path, value);

      if (response?.ok !== 1) {
        return {
          success: false,
          path,
          error: response?.error ?? "Unknown error setting memory"
        };
      }

      return {
        success: true,
        path,
        value
      };
    } catch (error) {
      console.error(`❌ Failed to set memory at path: ${path}`);
      if (error instanceof Error) {
        console.error(`   Error: ${error.message}`);
        // Log response data if available (for API errors)
        const apiError = error as Error & { response?: { status?: number; data?: unknown } };
        if (apiError.response) {
          console.error(`   Status: ${apiError.response.status}`);
          console.error(`   Response data:`, apiError.response.data);
        }
      }
      return {
        success: false,
        path,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Execute console command
   */
  public async executeConsole(command: string): Promise<ConsoleResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const shard = this.config.shard ?? "shard3";
      const response = await this.api.console(command, shard);

      return {
        success: true,
        output: response?.data ?? ""
      };
    } catch (error) {
      console.error(`❌ Failed to execute console command: ${command.substring(0, 50)}...`);
      if (error instanceof Error) {
        console.error(`   Error: ${error.message}`);
        // Log response data if available (for API errors)
        const apiError = error as Error & { response?: { status?: number; data?: unknown } };
        if (apiError.response) {
          console.error(`   Status: ${apiError.response.status}`);
          console.error(`   Response data:`, apiError.response.data);
        }
      }
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
