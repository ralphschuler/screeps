#!/bin/bash

# Validation script for test infrastructure
# Verifies that all test components are properly configured

set -e

echo "🔍 Validating test infrastructure..."
echo ""

# Check directories exist
echo "✓ Checking directory structure..."
test -d packages/screeps-server/test/integration && echo "  ✓ integration/"
test -d packages/screeps-server/test/performance && echo "  ✓ performance/"
test -d packages/screeps-server/test/packages && echo "  ✓ packages/"
test -d packages/screeps-server/test/fixtures && echo "  ✓ fixtures/"
test -d packages/screeps-server/test/helpers && echo "  ✓ helpers/"
test -d packages/screeps-server/scripts && echo "  ✓ scripts/"

# Check test files exist
echo ""
echo "✓ Checking test files..."
test -f packages/screeps-server/test/integration/basic.test.ts && echo "  ✓ basic.test.ts"
test -f packages/screeps-server/test/performance/cpu-budget.test.ts && echo "  ✓ cpu-budget.test.ts"
test -f packages/screeps-server/test/packages/framework.test.ts && echo "  ✓ framework.test.ts"

# Check configuration files
echo ""
echo "✓ Checking configuration..."
test -f packages/screeps-server/package.json && echo "  ✓ package.json"
test -f packages/screeps-server/tsconfig.json && echo "  ✓ tsconfig.json"
test -f packages/screeps-server/.mocharc.json && echo "  ✓ .mocharc.json"

# Check helper files
echo ""
echo "✓ Checking helpers..."
test -f packages/screeps-server/test/helpers/server-helper.ts && echo "  ✓ server-helper.ts"
test -f packages/screeps-server/test/fixtures/scenarios.ts && echo "  ✓ scenarios.ts"

# Check scripts
echo ""
echo "✓ Checking scripts..."
test -f packages/screeps-server/scripts/analyze-tests.js && echo "  ✓ analyze-tests.js"

# Check documentation
echo ""
echo "✓ Checking documentation..."
test -f packages/screeps-server/test/README.md && echo "  ✓ test/README.md"
test -f packages/screeps-server/TESTING_GUIDE.md && echo "  ✓ TESTING_GUIDE.md"

# Check CI integration
echo ""
echo "✓ Checking CI configuration..."
test -f .github/workflows/performance-test.yml && echo "  ✓ performance-test.yml"

# Verify package.json scripts
echo ""
echo "✓ Checking npm scripts..."
cd packages/screeps-server
npm run --silent || true  # List scripts
cd ../..

echo ""
echo "✅ Test infrastructure validation complete!"
echo ""
echo "Next steps:"
echo "  1. npm ci                        # Install dependencies"
echo "  2. npm run build                 # Build bot code"
echo "  3. npm run test:server           # Run server tests"
echo ""
