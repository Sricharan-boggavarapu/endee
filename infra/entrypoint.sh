#!/bin/bash
set -e

# Create data directories at runtime (in case they don't exist on ephemeral filesystem)
mkdir -p /data
chmod 755 /data

# Also ensure /mnt/data exists
mkdir -p /mnt/data
chmod 755 /mnt/data

# Run the server
exec /usr/local/bin/ndd-server
