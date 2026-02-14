---
template: module
type: builtin
description: Adds support for [Tile Map Service](https://en.wikipedia.org/wiki/Tile_Map_Service) (TMS) datasets.
---

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
