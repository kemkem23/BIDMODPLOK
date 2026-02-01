#!/bin/bash
# Production start script for 2000+ concurrent users
# Usage: ./start-production.sh
#
# This script:
# 1. Builds the React frontend into static files
# 2. Starts the optimized backend which serves everything on port 5000

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
BACKEND_DIR="$SCRIPT_DIR/backend"

echo ""
echo "=========================================="
echo "  Building frontend for production..."
echo "=========================================="
echo ""

cd "$FRONTEND_DIR"
npm run build

echo ""
echo "=========================================="
echo "  Starting production server..."
echo "=========================================="
echo ""

cd "$BACKEND_DIR"
NODE_OPTIONS="--max-old-space-size=4096" node cluster.js
