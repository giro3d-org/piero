---
name: WMSLoader
title: WMSLoader
---
# WMSLoader <Badge type="info" text="@giro3d/piero" />

<!---
This file was auto-generated from module-doc-template.md. Do not edit it manually !
-->

Add support for [Web Map Service](https://www.ogc.org/standards/wms/) (WMS) layers.



## Usage with [`createPieroApp`](../create-piero-app.md)

```js
import { loaders } from '@giro3d/piero/modules';

createPieroApp({
    ...
    modules: [
        loaders.WMSLoader
        ...
    ]
})
```


### The `wms` dataset

This module provides the `wms` dataset type, configured as such:

```json
{
    "type": "wms",
    "format": "image/jpeg",
    "url": "https://example.com/wms",
    "layer": "myLayer",
    "projection": "EPSG:3857"
    ...
}
```

