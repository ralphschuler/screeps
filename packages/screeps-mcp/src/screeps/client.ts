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
 * Console message structure from WebSocket
 */
interface ConsoleMessage {
  messages?: {
    log?: string[];
    results?: string[];
  };
  error?: string;
}

/**
 * Screeps API client for MCP server integration
 */
export class ScreepsClient {
  private config: ScreepsConfig;
  private api: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  private socket: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  private consoleMessageQueue: ConsoleMessage[] = [];
  private consoleWaiters: Array<(msg: ConsoleMessage) => void> = [];

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

    // Initialize WebSocket connection for console messages
    await this.initializeSocket();
  }

  /**
   * Initialize WebSocket connection and subscribe to console
   */
  private async initializeSocket(): Promise<void> {
    if (!this.api.socket) {
      return; // Socket not available (e.g., during tests)
    }

    try {
      // Connect to WebSocket
      this.socket = this.api.socket;
      await this.socket.connect();

      // Subscribe to console messages
      const userID = await this.api.userID();
      await this.socket.subscribe(`user:${userID}/console`);

      // Set up console message handler
      this.socket.on(`user:${userID}/console`, (msg: [string, ConsoleMessage]) => {
        const [, data] = msg;
        this.handleConsoleMessage(data);
      });
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
      // Don't throw - allow operation without WebSocket
    }
  }

  /**
   * Handle incoming console messages
   */
  private handleConsoleMessage(data: ConsoleMessage): void {
    // If there are waiters, deliver to the first one
    if (this.consoleWaiters.length > 0) {
      const waiter = this.consoleWaiters.shift();
      if (waiter) {
        waiter(data);
        return;
      }
    }

    // Otherwise, queue for later
    this.consoleMessageQueue.push(data);
  }

  /**
   * Wait for next console message with timeout
   */
  private async waitForConsoleMessage(timeoutMs: number = 5000): Promise<ConsoleMessage | null> {
    // Check if message already in queue
    if (this.consoleMessageQueue.length > 0) {
      return this.consoleMessageQueue.shift() || null;
    }

    // Wait for new message
    return new Promise((resolve) => {
      let isResolved = false;
      let timeoutHandle: NodeJS.Timeout;

      const waiter = (msg: ConsoleMessage) => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeoutHandle);
          resolve(msg);
        }
      };

      timeoutHandle = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          // Remove waiter from queue if timeout occurs
          const index = this.consoleWaiters.indexOf(waiter);
          if (index >= 0) {
            this.consoleWaiters.splice(index, 1);
          }
          resolve(null);
        }
      }, timeoutMs);

      this.consoleWaiters.push(waiter);
    });
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

    // TODO: API Error - Stats endpoint returns 404
    // Issue URL: https://github.com/ralphschuler/screeps/issues/481
    // Details: The memory.get("stats", shard) endpoint returns a 404 error
    // Encountered: When calling screeps_stats tool via MCP
    // Suggested Fix: Stats are not a standard memory path in Screeps. This method should either:
    // 1. Query a different API endpoint if one exists for stats
    // 2. Read from Memory.stats if users store stats there (but check if path exists first)
    // 3. Use api.raw.user.overview() to get some stats like CPU usage
    // 4. Remove this method if no valid stats endpoint exists
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
   * Execute console command and wait for response
   */
  public async executeConsole(command: string): Promise<ConsoleResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const shard = this.config.shard ?? "shard3";

      // Send the console command
      await this.api.console(command, shard);

      // Wait for console response via WebSocket
      if (this.socket) {
        const consoleMsg = await this.waitForConsoleMessage(5000);

        if (consoleMsg) {
          // Format the console output
          const outputParts: string[] = [];

          // Add log messages
          if (consoleMsg.messages?.log && consoleMsg.messages.log.length > 0) {
            outputParts.push(...consoleMsg.messages.log);
          }

          // Add results
          if (consoleMsg.messages?.results && consoleMsg.messages.results.length > 0) {
            outputParts.push(...consoleMsg.messages.results);
          }

          // Check for errors
          if (consoleMsg.error) {
            return {
              success: false,
              output: outputParts.join("\n"),
              error: consoleMsg.error
            };
          }

          return {
            success: true,
            output: outputParts.join("\n") || "Command executed successfully (no output)"
          };
        }

        // Timeout waiting for response
        return {
          success: true,
          output: "Command sent; no response received within timeout (5 seconds)"
        };
      }

      // No WebSocket, fallback to old behavior
      return {
        success: true,
        output: "Command sent; output appears in the Screeps in-game console."
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

  /**
   * Disconnect WebSocket and cleanup
   */
  public async disconnect(): Promise<void> {
    if (this.socket) {
      try {
        await this.socket.disconnect();
      } catch (error) {
        console.error("Error disconnecting socket:", error);
      }
      this.socket = null;
    }
    this.consoleMessageQueue = [];
    this.consoleWaiters = [];
  }

  /**
   * Get memory segment
   */
  public async getSegment(segment: number): Promise<import("../types.js").SegmentResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const shard = this.config.shard ?? "shard3";
      const response = await this.api.segment.get(segment, shard);

      return {
        success: true,
        data: response?.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Set memory segment
   */
  public async setSegment(segment: number, data: string): Promise<import("../types.js").SegmentResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const shard = this.config.shard ?? "shard3";
      await this.api.segment.set(segment, data, shard);

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get game time
   */
  public async getGameTime(): Promise<import("../types.js").GameTimeResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const shard = this.config.shard ?? "shard3";
      const response = await this.api.raw.game.time(shard);

      return {
        success: true,
        time: response?.time
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get room terrain
   */
  public async getRoomTerrain(room: string): Promise<import("../types.js").RoomTerrainResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const shard = this.config.shard ?? "shard3";
      const response = await this.api.raw.game.roomTerrain(room, 1, shard);

      return {
        success: true,
        terrain: response?.terrain?.[0]?.terrain
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get room objects
   */
  public async getRoomObjects(room: string): Promise<import("../types.js").RoomObjectsResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const shard = this.config.shard ?? "shard3";
      const response = await this.api.raw.game.roomObjects(room, shard);

      return {
        success: true,
        objects: response?.objects
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get room status
   */
  public async getRoomStatus(room: string): Promise<import("../types.js").ApiResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const shard = this.config.shard ?? "shard3";
      const response = await this.api.raw.game.roomStatus(room, shard);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get market orders
   */
  public async getMarketOrders(resourceType?: string): Promise<import("../types.js").MarketOrdersResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const shard = this.config.shard ?? "shard3";
      let response;

      if (resourceType) {
        response = await this.api.market.orders(resourceType, shard);
      } else {
        response = await this.api.market.ordersIndex(shard);
      }

      return {
        success: true,
        orders: response?.list || response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get my market orders
   */
  public async getMyMarketOrders(): Promise<import("../types.js").MarketOrdersResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const response = await this.api.market.myOrders();

      return {
        success: true,
        orders: response?.list
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get user info by username
   */
  public async getUserInfo(username: string): Promise<import("../types.js").ApiResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const response = await this.api.raw.user.find(username);

      return {
        success: true,
        data: response?.user
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get shard info
   */
  public async getShardInfo(): Promise<import("../types.js").ApiResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const response = await this.api.raw.game.shards.info();

      return {
        success: true,
        data: response?.shards
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get user world status
   */
  public async getUserWorldStatus(shard?: string): Promise<import("../types.js").ApiResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const targetShard = shard || this.config.shard;
      const response = await this.api.raw.user.worldStatus(targetShard);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get user start room
   */
  public async getUserWorldStartRoom(): Promise<import("../types.js").ApiResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const response = await this.api.raw.user.worldStartRoom();

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get user rooms
   */
  public async getUserRooms(userId: string): Promise<import("../types.js").ApiResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const response = await this.api.raw.user.rooms(userId);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get market stats
   */
  public async getMarketStats(resourceType: string, shard?: string): Promise<import("../types.js").ApiResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const targetShard = shard || this.config.shard;
      const response = await this.api.raw.market.stats(resourceType, targetShard);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get leaderboard seasons
   */
  public async getLeaderboardSeasons(): Promise<import("../types.js").ApiResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const response = await this.api.raw.leaderboard.seasons();

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Find user in leaderboard
   */
  public async findInLeaderboard(username: string, season?: string, mode?: string): Promise<import("../types.js").ApiResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const response = await this.api.raw.leaderboard.find(season, mode, username);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get leaderboard list
   */
  public async getLeaderboardList(season?: string, limit: number = 20, offset: number = 0, mode?: string): Promise<import("../types.js").ApiResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const response = await this.api.raw.leaderboard.list(season, limit, offset, mode);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get experimental PVP data
   */
  public async getExperimentalPvp(interval: number = 8): Promise<import("../types.js").ApiResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const response = await this.api.raw.experimental.pvp(interval);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get experimental nukes data
   */
  public async getExperimentalNukes(interval: number = 8): Promise<import("../types.js").ApiResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const response = await this.api.raw.experimental.nukes(interval);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get user money history
   */
  public async getUserMoneyHistory(page: number = 0): Promise<import("../types.js").ApiResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const response = await this.api.raw.user.moneyHistory(page);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get room decorations
   */
  public async getRoomDecorations(room: string, shard?: string): Promise<import("../types.js").ApiResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const targetShard = shard || this.config.shard;
      const response = await this.api.raw.game.roomDecorations(room, targetShard);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get user overview
   */
  public async getUserOverview(interval: number = 8, statName?: string): Promise<import("../types.js").ApiResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const response = await this.api.raw.user.overview(interval, statName);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get respawn prohibited rooms
   */
  public async getRespawnProhibitedRooms(): Promise<import("../types.js").ApiResult> {
    if (!this.api) {
      throw new Error("API not initialized. Call connect() first.");
    }

    try {
      const response = await this.api.raw.user.respawnProhibitedRooms();

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
