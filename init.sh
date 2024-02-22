#!/usr/bin/sh

npm --silent install
cp -u ./src/config.ts.sample ./src/config.ts
cp -u ./src/styles.ts.sample ./src/styles.ts

echo Configuration generated. Start the server with \'npm run start\'.
