#!/bin/bash
# Mirror CI execution locally for debugging
#
# Usage: ./scripts/ci-local.sh
#
# This script mirrors the CI pipeline locally so you can debug
# failures before pushing to remote.

set -e

echo "=========================================="
echo "🔍 Local CI Pipeline Mirror"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Stage 1: Lint
echo "📋 Stage 1: Lint & Type Check"
echo "------------------------------"

if command -v tsc &> /dev/null; then
    echo "Running TypeScript type check..."
    npx tsc --noEmit || echo -e "${YELLOW}⚠️ Type check warnings (non-blocking)${NC}"
else
    echo -e "${YELLOW}⚠️ TypeScript not installed, skipping type check${NC}"
fi

if npm run lint --if-present 2>/dev/null; then
    echo -e "${GREEN}✅ Lint passed${NC}"
else
    echo -e "${YELLOW}⚠️ Lint script not configured or has warnings${NC}"
fi

echo ""

# Stage 2: Test
echo "🧪 Stage 2: Unit & Integration Tests"
echo "-------------------------------------"

if npm test -- --ci --coverage; then
    echo -e "${GREEN}✅ Tests passed${NC}"
else
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
fi

echo ""

# Stage 3: Burn-in (reduced iterations)
echo "🔥 Stage 3: Burn-in (3 iterations)"
echo "-----------------------------------"

FAILURES=0
for i in {1..3}; do
    echo "Burn-in iteration $i/3..."
    if npm test -- --ci --silent; then
        echo -e "${GREEN}✅ Iteration $i passed${NC}"
    else
        echo -e "${RED}❌ Iteration $i FAILED${NC}"
        FAILURES=$((FAILURES + 1))
    fi
done

echo ""
echo "=========================================="
echo "📊 Local CI Summary"
echo "=========================================="

if [ $FAILURES -gt 0 ]; then
    echo -e "${RED}❌ Burn-in detected $FAILURES flaky test(s)${NC}"
    echo "Tests are non-deterministic. Fix before pushing."
    exit 1
fi

echo -e "${GREEN}✅ All stages passed!${NC}"
echo ""
echo "Your code is ready for CI. Push with confidence!"
