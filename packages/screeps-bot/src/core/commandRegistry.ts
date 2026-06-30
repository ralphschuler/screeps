/**
 * Bot command registry compatibility re-export.
 *
 * The framework console package owns command registration/decorator behavior;
 * the bot keeps this module only so existing imports continue to resolve while
 * packages/screeps-bot remains a thin integration layer.
 */

export {
  Command,
  clearCommandDecoratorMetadata,
  commandRegistry,
  getCommandDecoratorMetadata,
  registerAllDecoratedCommands,
  registerDecoratedCommands
} from "@ralphschuler/screeps-console";

export type { CommandMetadata } from "@ralphschuler/screeps-console";
