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
        
        // Screeps constants
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
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          accessibility: "explicit"
        }
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-shadow": [
        "error",
        {
          hoist: "all"
        }
      ],
      "@typescript-eslint/no-unused-expressions": "error",
      "@typescript-eslint/no-use-before-define": ["error", { functions: false }],
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/unified-signatures": "error",

      // General rules
      camelcase: "error",
      complexity: "off",
      "dot-notation": "error",
      eqeqeq: ["error", "smart"],
      "guard-for-in": "off",
      "id-match": "error",
      "max-classes-per-file": ["error", 1],
      "no-bitwise": "error",
      "no-caller": "error",
      "no-cond-assign": "error",
      "no-console": "error",
      "no-eval": "error",
      "no-invalid-this": "off",
      "no-new-wrappers": "error",
      "no-shadow": "off", // Use @typescript-eslint/no-shadow instead
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
