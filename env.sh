#!/usr/bin/env sh
# ================================================================================
# File: env.sh
# Description: Replaces environment variables in asset files.
# Usage: Run this script in your terminal, ensuring APP_PREFIX and ASSET_DIRS are set.
# ================================================================================

# Set the exit flag to exit immediately if any command fails
set -e

APP_PREFIX='PIERO_'
ASSET_DIR=/usr/share/nginx/html

# Display the current directory being scanned
echo "Scanning directory: $ASSET_DIR"

# Iterate through each environment variable that starts with APP_PREFIX
env | grep "^${APP_PREFIX}" | while IFS='=' read -r key value; do
    # Display the variable being replaced
    echo "  • Replacing ${key} → ${value}"

    # Use find and sed to replace the variable in all files within the directory
    find "$ASSET_DIR" -type f \
        -exec sed -i "s|${key}|${value}|g" {} +
done
