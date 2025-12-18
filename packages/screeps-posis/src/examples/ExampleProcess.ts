/**
 * Example POSIS Process
 *
 * Demonstrates how to create a process using the POSIS architecture:
 * - Extends BaseProcess for common functionality
 * - Uses syscalls for sleep, messaging, forking
 * - Implements state serialization
 * - Handles inter-process communication
 *
 * This is a reference implementation showing best practices.
 */

import { BaseProcess } from "../process/BaseProcess";

interface ExampleProcessState {
  counter: number;
  lastMessage?: string;
}

/**
 * Example process demonstrating POSIS features
 */
export class ExampleProcess extends BaseProcess {
  private counter = 0;
  private lastMessage?: string;

  constructor(id: string) {
    super(id, "ExampleProcess", 50);
  }

  /**
   * Initialize the process
   */
  protected onInit(): void {
    this.log("info", "Example process initialized", { id: this.id });
    
    // Subscribe to events
    this.on("exampleEvent", (data) => {
      this.log("info", "Received example event", { data });
    });
  }

  /**
   * Main process logic
   */
  protected doRun(): void {
    this.counter++;
    
    // Example 1: Log every 10 ticks
    if (this.counter % 10 === 0) {
      this.log("info", `Process running, counter: ${this.counter}`);
    }

    // Example 2: Sleep for 5 ticks after 20 runs
    if (this.counter === 20) {
      this.log("info", "Sleeping for 5 ticks");
      this.sleep(5);
      return;
    }

    // Example 3: Fork a child process after 30 runs (only if not already a child)
    if (this.counter === 30 && !this.id.endsWith("-child")) {
      this.log("info", "Forking child process");
      const childProcess = new ExampleProcess(`${this.id}-child`);
      this.fork(`${this.id}-child`, childProcess);
    }

    // Example 4: Send message to child after 40 runs
    if (this.counter === 40) {
      this.log("info", "Sending message to child");
      this.sendMessage(`${this.id}-child`, { type: "greeting", text: "Hello from parent!" });
    }

    // Example 5: Use shared memory
    const sharedCounter = (this.getSharedMemory("globalCounter") as number) || 0;
    this.setSharedMemory("globalCounter", sharedCounter + 1);

    // Example 6: Emit events
    if (this.counter % 5 === 0) {
      this.emit("exampleEvent", { counter: this.counter });
    }
  }

  /**
   * Handle incoming messages
   */
  protected handleMessage(message: unknown, senderId: string): void {
    const msg = message as { type: string; text: string };
    this.log("info", `Received message from ${senderId}: ${msg.text}`, { type: msg.type });
    this.lastMessage = msg.text;
  }

  /**
   * Serialize process state
   */
  protected serializeState(): Record<string, unknown> {
    return {
      counter: this.counter,
      lastMessage: this.lastMessage
    };
  }

  /**
   * Deserialize process state
   */
  protected deserializeState(state: Record<string, unknown>): void {
    if (state.counter !== undefined) {
      this.counter = state.counter as number;
    }
    if (state.lastMessage !== undefined) {
      this.lastMessage = state.lastMessage as string;
    }
  }

  /**
   * Cleanup when process is unregistered
   */
  protected onCleanup(): void {
    this.log("info", "Example process cleaning up", { 
      id: this.id, 
      finalCounter: this.counter 
    });
  }
}
