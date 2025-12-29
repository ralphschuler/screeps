#!/bin/bash

# Script to create a new Screeps package from template
# Usage: ./scripts/create-package.sh <package-name> "<description>"

set -e

# Check arguments
if [ $# -lt 2 ]; then
  echo "Usage: ./scripts/create-package.sh <package-name> \"<description>\""
  echo "Example: ./scripts/create-package.sh kernel \"Process scheduler and CPU management\""
  exit 1
fi

PACKAGE_NAME=$1
DESCRIPTION=$2
PACKAGE_DIR="packages/@ralphschuler/screeps-${PACKAGE_NAME}"

# Check if package already exists
if [ -d "$PACKAGE_DIR" ]; then
  echo "Error: Package $PACKAGE_DIR already exists"
  exit 1
fi

echo "Creating package: @ralphschuler/screeps-${PACKAGE_NAME}"
echo "Description: ${DESCRIPTION}"
echo ""

# Create directory structure
echo "Creating directory structure..."
mkdir -p "${PACKAGE_DIR}/src"
mkdir -p "${PACKAGE_DIR}/test"

# Create package.json
echo "Creating package.json..."
cat > "${PACKAGE_DIR}/package.json" << EOF
{
  "name": "@ralphschuler/screeps-${PACKAGE_NAME}",
  "version": "0.1.0",
  "description": "${DESCRIPTION}",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "private": false,
  "scripts": {
    "build": "tsc",
    "test": "mocha test/**/*.test.ts",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "screeps",
    "${PACKAGE_NAME}",
    "typescript"
  ],
  "author": "Ralph Schuler",
  "license": "Unlicense",
  "devDependencies": {
    "@types/chai": "^4.1.6",
    "@types/mocha": "^5.2.5",
    "@types/node": "^20.14.9",
    "@types/screeps": "^3.3.8",
    "chai": "^4.2.0",
    "mocha": "^11.7.5",
    "ts-node": "^10.2.0",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.4.3"
  }
}
EOF

# Create tsconfig.json
echo "Creating tsconfig.json..."
cat > "${PACKAGE_DIR}/tsconfig.json" << EOF
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node", "screeps"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
EOF

# Create tsconfig.test.json
echo "Creating tsconfig.test.json..."
cat > "${PACKAGE_DIR}/tsconfig.test.json" << EOF
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["node", "mocha", "chai", "screeps"]
  },
  "include": ["src/**/*", "test/**/*"]
}
EOF

# Create .mocharc.json
echo "Creating .mocharc.json..."
cat > "${PACKAGE_DIR}/.mocharc.json" << EOF
{
  "require": ["ts-node/register/transpile-only", "test/setup.ts"],
  "extension": ["ts"],
  "spec": "test/**/*.test.ts"
}
EOF

# Create test/setup.ts
echo "Creating test/setup.ts..."
cat > "${PACKAGE_DIR}/test/setup.ts" << 'EOF'
/**
 * Test setup and global mocks for Screeps tests
 */

// Mock global Game object
(global as any).Game = {
  time: 1000,
  cpu: {
    getUsed: () => 0,
    limit: 100,
    bucket: 10000
  },
  rooms: {},
  creeps: {},
  spawns: {},
  structures: {},
  flags: {},
  gcl: { level: 1, progress: 0, progressTotal: 1000000 },
  gpl: { level: 0, progress: 0, progressTotal: 1000000 },
  market: {},
  resources: {},
  shard: { name: 'shard0', type: 'normal', ptr: false }
};

// Mock Memory
(global as any).Memory = {
  stats: {},
  rooms: {},
  creeps: {}
};

// Mock RawMemory
(global as any).RawMemory = {
  segments: {},
  get: () => '',
  set: () => {}
};

// Mock InterShardMemory
(global as any).InterShardMemory = {
  getLocal: () => '',
  setLocal: () => {},
  getRemote: () => ''
};
EOF

# Create src/index.ts
echo "Creating src/index.ts..."
cat > "${PACKAGE_DIR}/src/index.ts" << EOF
/**
 * @ralphschuler/screeps-${PACKAGE_NAME}
 * 
 * ${DESCRIPTION}
 */

export * from './types';
EOF

# Create src/types.ts
echo "Creating src/types.ts..."
cat > "${PACKAGE_DIR}/src/types.ts" << EOF
/**
 * Type definitions for @ralphschuler/screeps-${PACKAGE_NAME}
 */

// Add your types here
EOF

# Create README.md
echo "Creating README.md..."
cat > "${PACKAGE_DIR}/README.md" << EOF
# @ralphschuler/screeps-${PACKAGE_NAME}

${DESCRIPTION}

## Installation

\`\`\`bash
npm install @ralphschuler/screeps-${PACKAGE_NAME}
\`\`\`

## Usage

\`\`\`typescript
import { } from '@ralphschuler/screeps-${PACKAGE_NAME}';

// Example usage
\`\`\`

## API

### Classes

<!-- Document your classes here -->

### Functions

<!-- Document your functions here -->

### Types

<!-- Document your types here -->

## Features

- Feature 1
- Feature 2
- Feature 3

## Testing

\`\`\`bash
npm test
\`\`\`

## License

Unlicense
EOF

echo ""
echo "Package created successfully at: ${PACKAGE_DIR}"
echo ""
echo "Next steps:"
echo "1. Move source files from packages/screeps-bot/src to ${PACKAGE_DIR}/src"
echo "2. Update imports in source files to be relative"
echo "3. Define public API in ${PACKAGE_DIR}/src/index.ts"
echo "4. Add tests in ${PACKAGE_DIR}/test"
echo "5. Update root package.json with build and test scripts"
echo "6. Run: npm install && npm run build:${PACKAGE_NAME} && npm run test:${PACKAGE_NAME}"
echo ""
echo "See docs/PACKAGE_TEMPLATE.md for detailed instructions"
