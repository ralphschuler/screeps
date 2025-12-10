import axios from 'axios';
import { LokiExporterConfig } from './config';
import { Logger } from './logger';

export interface LogEntry {
  type: string;
  level: string;
  message: string;
  tick: number;
  subsystem?: string;
  room?: string;
}

export interface LokiStream {
  stream: Record<string, string>;
  values: Array<[string, string]>; // [timestamp_ns, log_line]
}

export interface LokiPushRequest {
  streams: LokiStream[];
}

export class LokiClient {
  private config: LokiExporterConfig;
  private logger: Logger;
  private batchBuffer: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: LokiExporterConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.startBatchTimer();
  }

  /**
   * Add a log entry to the batch buffer
   */
  public addLog(entry: LogEntry): void {
    this.batchBuffer.push(entry);

    if (this.batchBuffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Start the batch flush timer
   */
  private startBatchTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.batchBuffer.length > 0) {
        this.flush();
      }
    }, this.config.batchIntervalMs);
  }

  /**
   * Stop the batch flush timer
   */
  public stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.batchBuffer.length > 0) {
      this.flush();
    }
  }

  /**
   * Flush all buffered logs to Loki
   */
  private async flush(): Promise<void> {
    if (this.batchBuffer.length === 0) return;

    const entries = [...this.batchBuffer];
    this.batchBuffer = [];

    try {
      const pushRequest = this.buildLokiPushRequest(entries);
      await this.sendToLoki(pushRequest);
      this.logger.info(`Flushed ${entries.length} log entries to Loki`);
    } catch (error) {
      this.logger.error('Failed to flush logs to Loki', error);
      // Re-add entries to buffer for retry (keep buffer size limited)
      this.batchBuffer.unshift(...entries.slice(-this.config.batchSize));
    }
  }

  /**
   * Build Loki push request from log entries
   */
  private buildLokiPushRequest(entries: LogEntry[]): LokiPushRequest {
    // Group entries by their label set
    const streamMap = new Map<string, Array<[string, string]>>();

    for (const entry of entries) {
      const labels: Record<string, string> = {
        ...this.config.extraLabels,
        level: entry.level,
        type: entry.type
      };

      if (entry.subsystem) {
        labels.subsystem = entry.subsystem;
      }

      if (entry.room) {
        labels.room = entry.room;
      }

      // Create a unique key for this label set
      const labelKey = JSON.stringify(labels);

      if (!streamMap.has(labelKey)) {
        streamMap.set(labelKey, []);
      }

      // Loki expects nanosecond timestamps
      // We use the tick as milliseconds and multiply by 1e6 for nanoseconds
      const timestampNs = (entry.tick * 1000 * 1e6).toString();
      const logLine = entry.message;

      streamMap.get(labelKey)!.push([timestampNs, logLine]);
    }

    // Convert map to streams
    const streams: LokiStream[] = [];
    for (const [labelKey, values] of streamMap.entries()) {
      const labels = JSON.parse(labelKey);
      streams.push({
        stream: labels,
        values: values.sort((a, b) => a[0].localeCompare(b[0])) // Sort by timestamp
      });
    }

    return { streams };
  }

  /**
   * Send push request to Loki
   */
  private async sendToLoki(request: LokiPushRequest): Promise<void> {
    const auth = Buffer.from(`${this.config.lokiUsername}:${this.config.lokiApiKey}`).toString('base64');

    await axios.post(this.config.lokiUrl, request, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    });
  }
}
