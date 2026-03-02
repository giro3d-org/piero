---
template: module
type: builtin
description: Add support for [Web Map Service](https://www.ogc.org/standards/wms/) (WMS) layers.
---

## Usage

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
