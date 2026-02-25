# OSMLoader <Badge type="info" text="@giro3d/piero" />

<!---
This file was auto-generated from module-doc-template.md. Do not edit it manually !
-->

Add support for OpenStreetMap layers.

## Usage with [`createPieroApp`](../create-piero-app.md)

```js
import { loaders } from '@giro3d/piero/modules';

createPieroApp({
    ...
    modules: [
        loaders.OSMLoader
        ...
    ]
})
```

### The `osm` dataset

This module provides the `osm` dataset type, configured as such:

```json
{
    "type": "osm",
    ...
}
```

No additional configuration is required.

This will add the default OpenStreetMap layer to the basemap.
