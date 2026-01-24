import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import prettierConfig from "eslint-config-prettier";

export default [
  // Base ESLint recommended rules
  js.configs.recommended,

  // TypeScript files configuration
  {
    files: ["src/**/*.ts"],
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
        
        // Body part constants
        MOVE: "readonly",
        WORK: "readonly",
        CARRY: "readonly",
        ATTACK: "readonly",
        RANGED_ATTACK: "readonly",
        TOUGH: "readonly",
        HEAL: "readonly",
        CLAIM: "readonly",
        
        // Terrain constants
        TERRAIN_MASK_WALL: "readonly",
        TERRAIN_MASK_SWAMP: "readonly",
        TERRAIN_MASK_LAVA: "readonly",
        
        // Direction constants
        TOP: "readonly",
        TOP_RIGHT: "readonly",
        RIGHT: "readonly",
        BOTTOM_RIGHT: "readonly",
        BOTTOM: "readonly",
        BOTTOM_LEFT: "readonly",
        LEFT: "readonly",
        TOP_LEFT: "readonly",
        
        // Color constants
        COLOR_RED: "readonly",
        COLOR_PURPLE: "readonly",
        COLOR_BLUE: "readonly",
        COLOR_CYAN: "readonly",
        COLOR_GREEN: "readonly",
        COLOR_YELLOW: "readonly",
        COLOR_ORANGE: "readonly",
        COLOR_BROWN: "readonly",
        COLOR_GREY: "readonly",
        COLOR_WHITE: "readonly",
        
        // Look constants
        LOOK_CREEPS: "readonly",
        LOOK_ENERGY: "readonly",
        LOOK_RESOURCES: "readonly",
        LOOK_SOURCES: "readonly",
        LOOK_MINERALS: "readonly",
        LOOK_STRUCTURES: "readonly",
        LOOK_FLAGS: "readonly",
        LOOK_CONSTRUCTION_SITES: "readonly",
        LOOK_NUKES: "readonly",
        LOOK_TERRAIN: "readonly",
        LOOK_TOMBSTONES: "readonly",
        LOOK_POWER_CREEPS: "readonly",
        LOOK_DEPOSITS: "readonly",
        LOOK_RUINS: "readonly",
        
        // Screeps classes
        Room: "readonly",
        Creep: "readonly",
        Structure: "readonly",
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
        Source: "readonly",
        Mineral: "readonly",
        Deposit: "readonly",
        Tombstone: "readonly",
        Ruin: "readonly",
        Resource: "readonly",
        Nuke: "readonly",
        ConstructionSite: "readonly",
        PowerCreep: "readonly",
        RoomPosition: "readonly",
        RoomVisual: "readonly",
        MapVisual: "readonly",
        RoomTerrain: "readonly",
        RoomObject: "readonly",
        CostMatrix: "readonly",
        PathFinder: "readonly",
        
        // Screeps type constants
        StructureConstant: "readonly",
        ResourceConstant: "readonly",
        BodyPartConstant: "readonly",
        DirectionConstant: "readonly",
        FindConstant: "readonly",
        LookConstant: "readonly",
        ScreepsReturnCode: "readonly",
        CommodityConstant: "readonly",
        MineralConstant: "readonly",
        MineralBoostConstant: "readonly",
        MineralCompoundConstant: "readonly",
        PowerConstant: "readonly",
        PowerClassConstant: "readonly",
        BuildableStructureConstant: "readonly",
        
        // Screeps utility types
        Id: "readonly",
        PathStep: "readonly",
        MoveToOpts: "readonly",
        PathFinderPath: "readonly",
        LineStyle: "readonly",
        CircleStyle: "readonly",
        
        // Screeps structure types
        AnyStoreStructure: "readonly",
        AnyOwnedStructure: "readonly",
        OwnedStructure: "readonly",
        
        // Screeps memory types
        CreepMemory: "readonly",
        RoomMemory: "readonly",
        
        // Screeps internal types
        _HasId: "readonly",
        
        // Power constants
        POWER_INFO: "readonly",
        POWER_CLASS: "readonly",
        PWR_GENERATE_OPS: "readonly",
        PWR_OPERATE_SPAWN: "readonly",
        PWR_OPERATE_TOWER: "readonly",
        PWR_OPERATE_STORAGE: "readonly",
        PWR_OPERATE_LAB: "readonly",
        PWR_OPERATE_EXTENSION: "readonly",
        PWR_OPERATE_FACTORY: "readonly",
        PWR_DISRUPT_SPAWN: "readonly",
        PWR_DISRUPT_TOWER: "readonly",
        PWR_DISRUPT_TERMINAL: "readonly",
        PWR_SHIELD: "readonly",
        PWR_REGEN_SOURCE: "readonly",
        PWR_FORTIFY: "readonly",
        
        // Market constants
        ORDER_BUY: "readonly",
        ORDER_SELL: "readonly",
        
        // Advanced resource constants
        RESOURCE_CATALYZED_GHODIUM_ACID: "readonly",
        RESOURCE_CATALYZED_GHODIUM_ALKALIDE: "readonly",
        RESOURCE_CATALYZED_KEANIUM_ACID: "readonly",
        RESOURCE_CATALYZED_KEANIUM_ALKALIDE: "readonly",
        RESOURCE_CATALYZED_LEMERGIUM_ACID: "readonly",
        RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE: "readonly",
        RESOURCE_CATALYZED_UTRIUM_ACID: "readonly",
        RESOURCE_CATALYZED_UTRIUM_ALKALIDE: "readonly",
        RESOURCE_CATALYZED_ZYNTHIUM_ACID: "readonly",
        RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE: "readonly",
        
        // Other globals
        console: "readonly",
        _: "readonly",
        global: "writable"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint,
      import: importPlugin
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"]
      },
      "import/resolver": {
        typescript: {}
      }
    },
    rules: {
      // TypeScript ESLint rules
      "@typescript-eslint/array-type": "error",
      "@typescript-eslint/consistent-type-assertions": "error",
      "@typescript-eslint/consistent-type-definitions": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-member-accessibility": "off", // Allow implicit public
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }],
      "@typescript-eslint/no-shadow": "warn", // Downgrade to warning
      "@typescript-eslint/no-unused-expressions": "error",
      "@typescript-eslint/no-use-before-define": ["error", { functions: false }],
      "@typescript-eslint/prefer-for-of": "off", // Allow traditional for loops
      "@typescript-eslint/unified-signatures": "error",

      // General rules
      camelcase: ["error", {
        allow: ["^viz_", "^debug_", "^ranged_attack$"]
      }],
      complexity: "off",
      "dot-notation": "error",
      eqeqeq: ["error", "smart"],
      "guard-for-in": "off",
      "id-match": "error",
      "max-classes-per-file": "off", // Allow multiple helper classes in one file
      "no-bitwise": "off", // Allow bitwise for Screeps flag operations
      "no-caller": "error",
      "no-cond-assign": "error",
      "no-console": "error",
      "no-eval": "error",
      "no-invalid-this": "off",
      "no-new-wrappers": "error",
      "no-shadow": "off", // Use @typescript-eslint/no-shadow instead
      "no-unused-vars": "off", // Use @typescript-eslint/no-unused-vars instead
      "no-throw-literal": "error",
      "no-undef-init": "error",
      "no-underscore-dangle": "warn",
      "no-var": "error",
      "object-shorthand": "error",
      "one-var": ["error", "never"],
      radix: "error",
      "sort-imports": "warn",
      "spaced-comment": "error",

      // Import plugin rules
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index"
          ],
          "newlines-between": "never",
          alphabetize: {
            order: "asc",
            caseInsensitive: true
          }
        }
      ],
      "import/no-unresolved": [
        "error",
        {
          ignore: ["^@ralphschuler/"] // Ignore workspace packages
        }
      ],
      "import/no-duplicates": "error"
    }
  },

  // Files where console.log is allowed
  {
    files: [
      "src/core/logger.ts",
      "src/utils/legacy/ErrorMapper.ts",
      "src/core/unifiedStats.ts",
      "src/standards/consoleCommands.ts"
    ],
    rules: {
      "no-console": "off"
    }
  },

  // Apply Prettier config last to override conflicting rules
  prettierConfig
];
