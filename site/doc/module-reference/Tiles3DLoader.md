# Tiles3DLoader <Badge type="info" text="@giro3d/piero" />

<!---
This file was auto-generated from module-doc-template.md. Do not edit it manually !
-->

Adds support for [3D Tiles](https://cesium.com/why-cesium/3d-tiles/) datasets.



## Usage with [`createPieroApp`](../create-piero-app.md)

```js
import { loaders } from '@giro3d/piero/modules';

createPieroApp({
    ...
    modules: [
        loaders.Tiles3DLoader
        ...
    ]
})
```


## Usage

This module provides the `3dtiles` dataset type, configured as such:

```json
{
    "type": "3dtiles",
    "url": "https://example.com/path/to/tileset.json",
    ...
}
```

