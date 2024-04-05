#!/usr/bin/env bash

npm --silent install
cp ./src/config.ts.sample ./src/config.ts
cp ./src/styles.ts.sample ./src/styles.ts

echo Configuration generated. Start the server with \'npm run start\'.
