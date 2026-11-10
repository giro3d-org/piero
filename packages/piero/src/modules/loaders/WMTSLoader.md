---
template: module
type: builtin
description: Add support for WMTS (Web Map Tile Service) layers.
---

## Usage

This module provides the `wmts` dataset type, configured as such:

```json
{
    "type": "wmts",
    "url": "https://example.com/wmts/getCapabilities",
    "layer": "myLayer",
    "format": "image/jpeg",
    "name": "My WMTS Layer"
}
```

The module automatically fetches the WMTS capabilities document from the provided URL to configure the layer.
