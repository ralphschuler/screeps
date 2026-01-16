import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

/**
 * Shared ESLint configuration for Screeps framework packages
 * This configuration is extended by individual packages
 */
export default [
  // Base ESLint recommended rules
  js.configs.recommended,

  // TypeScript files configuration
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
        ecmaVersion: 2018
      },
      globals: {
        // Screeps globals
        Game: "readonly",
        Memory: "readonly",
        PathFinder: "readonly",
        RawMemory: "readonly",
        InterShardMemory: "readonly",
        
        // Screeps constants - Error codes
        OK: "readonly",
        ERR_NOT_OWNER: "readonly",
        ERR_NO_PATH: "readonly",
        ERR_NAME_EXISTS: "readonly",
        ERR_BUSY: "readonly",
        ERR_NOT_FOUND: "readonly",
        ERR_NOT_ENOUGH_ENERGY: "readonly",
        ERR_NOT_ENOUGH_RESOURCES: "readonly",
        ERR_INVALID_TARGET: "readonly",
        ERR_FULL: "readonly",
        ERR_NOT_IN_RANGE: "readonly",
        ERR_INVALID_ARGS: "readonly",
        ERR_TIRED: "readonly",
        ERR_NO_BODYPART: "readonly",
        ERR_NOT_ENOUGH_EXTENSIONS: "readonly",
        ERR_RCL_NOT_ENOUGH: "readonly",
        ERR_GCL_NOT_ENOUGH: "readonly",
        
        // Find constants
        FIND_EXIT_TOP: "readonly",
        FIND_EXIT_RIGHT: "readonly",
        FIND_EXIT_BOTTOM: "readonly",
        FIND_EXIT_LEFT: "readonly",
        FIND_EXIT: "readonly",
        FIND_CREEPS: "readonly",
        FIND_MY_CREEPS: "readonly",
        FIND_HOSTILE_CREEPS: "readonly",
        FIND_SOURCES_ACTIVE: "readonly",
        FIND_SOURCES: "readonly",
        FIND_DROPPED_RESOURCES: "readonly",
        FIND_STRUCTURES: "readonly",
        FIND_MY_STRUCTURES: "readonly",
        FIND_HOSTILE_STRUCTURES: "readonly",
        FIND_FLAGS: "readonly",
        FIND_CONSTRUCTION_SITES: "readonly",
        FIND_MY_SPAWNS: "readonly",
        FIND_HOSTILE_SPAWNS: "readonly",
        FIND_MY_CONSTRUCTION_SITES: "readonly",
        FIND_HOSTILE_CONSTRUCTION_SITES: "readonly",
        FIND_MINERALS: "readonly",
        FIND_NUKES: "readonly",
        FIND_TOMBSTONES: "readonly",
        FIND_POWER_CREEPS: "readonly",
        FIND_MY_POWER_CREEPS: "readonly",
        FIND_HOSTILE_POWER_CREEPS: "readonly",
        FIND_DEPOSITS: "readonly",
        FIND_RUINS: "readonly",
        
        // Structure constants
        STRUCTURE_SPAWN: "readonly",
        STRUCTURE_EXTENSION: "readonly",
        STRUCTURE_ROAD: "readonly",
        STRUCTURE_WALL: "readonly",
        STRUCTURE_RAMPART: "readonly",
        STRUCTURE_KEEPER_LAIR: "readonly",
        STRUCTURE_PORTAL: "readonly",
        STRUCTURE_CONTROLLER: "readonly",
        STRUCTURE_LINK: "readonly",
        STRUCTURE_STORAGE: "readonly",
        STRUCTURE_TOWER: "readonly",
        STRUCTURE_OBSERVER: "readonly",
        STRUCTURE_POWER_BANK: "readonly",
        STRUCTURE_POWER_SPAWN: "readonly",
        STRUCTURE_EXTRACTOR: "readonly",
        STRUCTURE_LAB: "readonly",
        STRUCTURE_TERMINAL: "readonly",
        STRUCTURE_CONTAINER: "readonly",
        STRUCTURE_NUKER: "readonly",
        STRUCTURE_FACTORY: "readonly",
        STRUCTURE_INVADER_CORE: "readonly",
        
        // Structure classes
        StructureSpawn: "readonly",
        StructureExtension: "readonly",
        StructureRoad: "readonly",
        StructureWall: "readonly",
        StructureRampart: "readonly",
        StructureKeeperLair: "readonly",
        StructurePortal: "readonly",
        StructureController: "readonly",
        StructureLink: "readonly",
        StructureStorage: "readonly",
        StructureTower: "readonly",
        StructureObserver: "readonly",
        StructurePowerBank: "readonly",
        StructurePowerSpawn: "readonly",
        StructureExtractor: "readonly",
        StructureLab: "readonly",
        StructureTerminal: "readonly",
        StructureContainer: "readonly",
        StructureNuker: "readonly",
        StructureFactory: "readonly",
        StructureInvaderCore: "readonly",
        
        // Resource constants
        RESOURCE_ENERGY: "readonly",
        RESOURCE_POWER: "readonly",
        RESOURCE_HYDROGEN: "readonly",
        RESOURCE_OXYGEN: "readonly",
        RESOURCE_UTRIUM: "readonly",
        RESOURCE_LEMERGIUM: "readonly",
        RESOURCE_KEANIUM: "readonly",
        RESOURCE_ZYNTHIUM: "readonly",
        RESOURCE_CATALYST: "readonly",
        RESOURCE_GHODIUM: "readonly",
        RESOURCE_UTRIUM_BAR: "readonly",
        RESOURCE_LEMERGIUM_BAR: "readonly",
        RESOURCE_KEANIUM_BAR: "readonly",
        RESOURCE_ZYNTHIUM_BAR: "readonly",
        RESOURCE_GHODIUM_MELT: "readonly",
        RESOURCE_OXIDANT: "readonly",
        RESOURCE_REDUCTANT: "readonly",
        RESOURCE_PURIFIER: "readonly",
        RESOURCE_BATTERY: "readonly",
        
        // Body part constants
        MOVE: "readonly",
        WORK: "readonly",
        CARRY: "readonly",
        ATTACK: "readonly",
        RANGED_ATTACK: "readonly",
        TOUGH: "readonly",
        HEAL: "readonly",
        CLAIM: "readonly",
        
        // Direction constants
        TOP: "readonly",
        TOP_RIGHT: "readonly",
        RIGHT: "readonly",
        BOTTOM_RIGHT: "readonly",
        BOTTOM: "readonly",
        BOTTOM_LEFT: "readonly",
        LEFT: "readonly",
        TOP_LEFT: "readonly",
        
        // Screeps classes
        Room: "readonly",
        Creep: "readonly",
        Structure: "readonly",
        Source: "readonly",
        Mineral: "readonly",
        RoomPosition: "readonly",
        Nuke: "readonly",
        PowerCreep: "readonly",
        
        // Screeps types
        Id: "readonly",
        StructureConstant: "readonly",
        ResourceConstant: "readonly",
        BodyPartConstant: "readonly",
        DirectionConstant: "readonly",
        FindConstant: "readonly",
        LookConstant: "readonly",
        ScreepsReturnCode: "readonly",
        CommodityConstant: "readonly",
        MineralConstant: "readonly",
        
        // Test globals
        describe: "readonly",
        it: "readonly",
        before: "readonly",
        after: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        expect: "readonly",
        
        // Other globals
        console: "readonly",
        _: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint,
      import: importPlugin
    },
    rules: {
      // TypeScript ESLint rules - relaxed for framework packages
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }],
      "@typescript-eslint/explicit-function-return-type": "off",
      
      // General rules - enforced to prevent dead code
      "no-console": "off", // Allow console for framework packages
      "no-undef": "off", // Disable for Screeps - TypeScript handles this better
      "no-unused-vars": "off", // Use @typescript-eslint/no-unused-vars instead
      "no-var": "error",
      "prefer-const": "error", // Upgraded from warn to error
      "no-throw-literal": "error",
      "no-unreachable": "error", // Prevent unreachable code after return/throw
      "no-constant-condition": "error", // Prevent if(false) and similar patterns
      
      // Import rules - upgraded to errors for required code only philosophy
      "import/no-unresolved": "off", // Disable until we configure resolvers
      "import/no-duplicates": "error" // Upgraded from warn to error
    }
  }
];
