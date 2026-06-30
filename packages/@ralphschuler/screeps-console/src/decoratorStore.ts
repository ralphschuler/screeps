/**
 * Storage and lookup helpers for @Command decorator metadata.
 *
 * Decorators may run before command instances exist. This store keeps that
 * metadata compact and exposes instance-scoped lookups for registration.
 */

import type { CommandDecoratorMetadata, CommandMetadata } from "./commandTypes";

const commandDecoratorStore: CommandDecoratorMetadata[] = [];

/** Store one metadata entry per decorated target/method/command name. */
export function storeCommandDecoratorMetadata(metadata: CommandMetadata, methodName: string, target: object): void {
  const alreadyStored = commandDecoratorStore.some(
    entry => entry.target === target && entry.methodName === methodName && entry.metadata.name === metadata.name
  );

  if (!alreadyStored) {
    commandDecoratorStore.push({
      metadata,
      methodName,
      target
    });
  }
}

/** Return decorator metadata applicable to an instance's prototype chain. */
export function getDecoratorMetadataForInstance(instance: object): CommandDecoratorMetadata[] {
  const instancePrototype = Object.getPrototypeOf(instance) as object | null;

  return commandDecoratorStore.filter(entry => isDecoratorForInstance(entry.target, instancePrototype));
}

/** Get all stored command decorator metadata for debugging/tests. */
export function getCommandDecoratorMetadata(): CommandDecoratorMetadata[] {
  return [...commandDecoratorStore];
}

/** Clear all stored command decorator metadata for tests/resets. */
export function clearCommandDecoratorMetadata(): void {
  commandDecoratorStore.length = 0;
}

function isDecoratorForInstance(decoratorTarget: object, instancePrototype: object | null): boolean {
  if (instancePrototype === null) return false;

  return (
    decoratorTarget === instancePrototype ||
    Object.getPrototypeOf(decoratorTarget) === instancePrototype ||
    decoratorTarget === Object.getPrototypeOf(instancePrototype)
  );
}
