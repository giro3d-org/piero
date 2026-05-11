# Graticule <Badge type="info" text="@giro3d/piero" />

<!---
This file was auto-generated from module-doc-template.md. Do not edit it manually !
-->

Add a graticule on the basemap.



## Usage with [`createPieroApp`](../create-piero-app.md)

```js
import { misc } from '@giro3d/piero/modules';

createPieroApp({
    ...
    modules: [
        misc.Graticule
        ...
    ]
})
```


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

