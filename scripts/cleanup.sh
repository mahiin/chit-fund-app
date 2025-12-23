#!/bin/bash

# Database Cleanup Script (Shell version)
# 
# Usage:
#   ./scripts/cleanup.sh [type]
# 
# Types:
#   - all (default): Delete all members and chit sets
#   - members: Delete only members
#   - sets: Delete only chit sets

TYPE=${1:-all}

echo "🧹 Database Cleanup Script"
echo ""
echo "Type: $TYPE"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    exit 1
fi

# Run the Node.js cleanup script
node scripts/cleanup.js $TYPE


