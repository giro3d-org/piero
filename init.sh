#!/usr/bin/env bash

npm --silent install
cp -n ./src/config.ts.sample ./src/config.ts
cp -n ./src/styles.ts.sample ./src/styles.ts

echo Configuration generated. Start the server with \'npm run start\'.
