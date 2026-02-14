---
name: TMSLoader
title: TMSLoader
---
# TMSLoader <Badge type="info" text="@giro3d/piero" />

<!---
This file was auto-generated from module-doc-template.md. Do not edit it manually !
-->

Adds support for [Tile Map Service](https://en.wikipedia.org/wiki/Tile_Map_Service) (TMS) datasets.



## Usage with [`createPieroApp`](../create-piero-app.md)

```js
import { loaders } from '@giro3d/piero/modules';

createPieroApp({
    ...
    modules: [
        loaders.TMSLoader
        ...
    ]
})
```


### The `tms` dataset

This module provides the `tms` dataset type, configured as such:

```json
{
    "type": "tms",
    "url": "https://example.com/tms/1.0.0/layer/{z}/{x}/{y}.png",
    "projection": "EPSG:3857"
    ...
}
```

