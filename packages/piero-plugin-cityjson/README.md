<div align="center">
  <a href="https://piero.giro3d.org">
    <img src="https://piero.giro3d.org/piero_logo.svg" height="120" alt="Piero">
  </a>
</div>

<div align="center">
  A versatile web library to visualize 3D geospatial data in the browser.
</div>

<br>

<div align="center">
  <a href="https://gitlab.com/giro3d/piero/badges/main/pipeline.svg"><img src="https://gitlab.com/giro3d/piero/badges/main/pipeline.svg" alt="Pipeline status"></a>
  <a href="https://www.npmjs.com/package/@giro3d/piero-plugin-cityjson"><img alt="NPMJS latest package badge" src="https://img.shields.io/npm/v/@giro3d/piero-plugin-cityjson?color=blue"></a>
  <a href="https://matrix.to/#/#giro3d:matrix.org"><img src="https://img.shields.io/matrix/giro3d:matrix.org" alt="Matrix chat"></a>
</div>

## `piero-plugin-cityjson`

Plugin for `@giro3d/piero` to add support for CityJSON datasets.

## Getting started

Register the `CityJSONLoader` module when starting the app:

```ts
// index.ts
import { createPieroApp } from '@giro3d/piero';
import { CityJSONLoader } from '@giro3d/piero-plugin-cityjson';

createPieroApp({
    ...
    modules: [
        new CityJSONLoader(),
    ]
});
```
