---
template: module
type: builtin
description: Add a graticule on the basemap.
---

## Usage

This module adds the `graticule` dataset type, configured as such :

```json
{
    "type": "graticule",
    ...
}
```

When active, this dataset adds a graticule on the basemap. The steps of the graticule are
automatically computed depending on the camera location.
