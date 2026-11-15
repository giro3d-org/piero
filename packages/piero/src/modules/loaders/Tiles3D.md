---
template: module
type: builtin
description: Adds support for [3D Tiles](https://cesium.com/why-cesium/3d-tiles/) datasets.
---

## Usage

This module provides the `3dtiles` dataset type, configured as such:

```json
{
    "type": "3dtiles",
    "url": "https://example.com/path/to/tileset.json",
    ...
}
```

For a point cloud, you can customize the coloring, based on the altitude for instance:

```json
{
    "type": "3dtiles",
    "url": "https://example.com/path/to/point-cloud-tileset.json",
    "style": {
        "colorMap": {
            "min": 25, // Ramp lower bound altitude
            "max": 40, // Ramp upper bound altitude
            "ramp": "Viridis" // Ramp name
        },
        "displayMode": "elevation"
    }
}
```

See [Tiles3DDataset](/api/@giro3d/piero/modules/namespaces/loaders/namespaces/Tiles3D/type-aliases/Tiles3DDataset) for all available options.
