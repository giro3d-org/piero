---
template: module
type: builtin
description: Add support for [Potree](https://potree.github.io/) point cloud datasets.
---

## Usage

This module provides the `potree` dataset type for loading large point cloud datasets, configured as such:

```json
{
    "type": "potree",
    "url": "https://example.com/path/to/metadata.json",
    "name": "My Potree Point Cloud"
}
```

> [!note]
> The URL should point to the Potree metadata.json file which describes the point cloud hierarchy.
