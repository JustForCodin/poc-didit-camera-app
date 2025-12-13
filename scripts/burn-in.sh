#!/bin/bash
# Burn-in loop for flaky test detection
#
# Usage: ./scripts/burn-in.sh [iterations]
#
# Default: 10 iterations
# Quick check: ./scripts/burn-in.sh 3
# Thorough: ./scripts/burn-in.sh 100

set -e

ITERATIONS=${1:-10}

echo "=========================================="
echo "🔥 Burn-in Test Loop"
echo "=========================================="
echo "Running $ITERATIONS iterations to detect flaky tests..."
echo ""

FAILURES=0
PASS_COUNT=0

for i in $(seq 1 $ITERATIONS); do
    echo "=========================================="
    echo "🔥 Iteration $i/$ITERATIONS"
    echo "=========================================="

    if npm test -- --ci --silent; then
        echo "✅ Passed"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo "❌ FAILED"
        FAILURES=$((FAILURES + 1))
    fi

    echo ""
done

echo "=========================================="
echo "📊 Burn-in Results"
echo "=========================================="
echo ""
echo "Total iterations: $ITERATIONS"
echo "Passed: $PASS_COUNT"
echo "Failed: $FAILURES"
echo "Pass rate: $(( PASS_COUNT * 100 / ITERATIONS ))%"
echo ""

if [ $FAILURES -gt 0 ]; then
    echo "❌ FLAKY TESTS DETECTED!"
    echo ""
    echo "Your tests failed $FAILURES out of $ITERATIONS iterations."
    echo "This indicates non-deterministic behavior."
    echo ""
    echo "Common causes:"
    echo "  - Race conditions in async code"
    echo "  - Timing dependencies (setTimeout, intervals)"
    echo "  - Shared state between tests"
    echo "  - External service dependencies"
    echo "  - Random data without seeds"
    echo ""
    echo "Tips for debugging:"
    echo "  1. Run individual failing tests in isolation"
    echo "  2. Add console.log to track test execution order"
    echo "  3. Check for cleanup issues in beforeEach/afterEach"
    echo "  4. Use jest --runInBand to run tests sequentially"
    exit 1
else
    echo "✅ All $ITERATIONS iterations passed!"
    echo "Your tests are stable and ready for CI."
fi
