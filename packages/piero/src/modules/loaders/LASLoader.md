---
template: module
type: builtin
description: Add support for LAS/LAZ point cloud files and COPC (Cloud-Optimized Point Cloud) files.
---

## Usage

This module provides two dataset types: `las` for LAS/LAZ files and `copc` for Cloud-Optimized Point Cloud files.

### LAS/LAZ Files

```json
{
    "type": "las",
    "url": "https://example.com/pointcloud.laz",
    "name": "My Point Cloud"
}
```

### COPC Files

```json
{
    "type": "copc",
    "url": "https://example.com/pointcloud.copc.laz",
    "name": "My COPC Point Cloud",
    "attribute": "Intensity",
    "style": {
        "colorMap": {
            "min": 0,
            "max": 255,
            "ramp": "Greys"
        }
    }
}
```
