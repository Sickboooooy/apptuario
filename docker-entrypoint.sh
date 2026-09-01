#!/bin/sh
set -eu

export CI=true

wrangler d1 migrations apply DB \
  --local \
  --config dist/server/wrangler.json \
  --persist-to /app/.wrangler/state

exec wrangler dev \
  --config dist/server/wrangler.json \
  --ip 0.0.0.0 \
  --port 3000 \
  --persist-to /app/.wrangler/state
