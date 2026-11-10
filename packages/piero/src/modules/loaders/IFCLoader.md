---
template: module
type: builtin
description: Add support for IFC (Industry Foundation Classes) files.
---

## Usage

This module provides the `ifc` dataset type for loading Building Information Modeling (BIM) data, configured as such:

```json
{
    "type": "ifc",
    "url": "https://example.com/model.ifc",
    "name": "My IFC Model",
    "position": [0, 0, 0]
}
```

> [!note]
> This module requires the `web-ifc.wasm` file to be available.
