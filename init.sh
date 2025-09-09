#!/usr/bin/env bash

npm --silent install --force
cp -n ./config.ts.sample ./config.ts
cp -n ./styles.ts.sample ./styles.ts

echo Configuration generated. Start the server with \'npm run start\'.
