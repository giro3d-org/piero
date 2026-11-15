---
template: module
type: builtin
description: Add support for Mapbox tilesets.
---

## Usage

This module provides the `mapbox` dataset type for accessing various Mapbox tilesets, configured as such:

```json
{
    "type": "mapbox",
    "tileset": "mapbox.satellite",
    "token": "your-mapbox-access-token",
    "name": "Mapbox Satellite"
}
```

Available tilesets:

- `mapbox.mapbox-terrain-dem-v1` - Terrain elevation (PNG raw format)
- `mapbox.terrain-rgb` - Terrain RGB (PNG raw format)
- `mapbox.satellite` - Satellite imagery (JPEG format)

> [!note]
> A valid Mapbox access token is required to use this module.
