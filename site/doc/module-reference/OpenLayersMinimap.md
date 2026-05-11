# OpenLayersMinimap <Badge type="info" text="@giro3d/piero" />

<!---
This file was auto-generated from module-doc-template.md. Do not edit it manually !
-->

Add a minimap widget based on OpenLayers.



## Usage with [`createPieroApp`](../create-piero-app.md)

```js
import { misc } from '@giro3d/piero/modules';

createPieroApp({
    ...
    modules: [
        misc.OpenLayersMinimap
        ...
    ]
})
```


## Usage

This module adds a widget in the main view containing a minimap synchronized to the main view. This
minimap contains the OpenStreetMap basemap.

Clicking on the minimap collapses/expands it. Note that when the minimap is collapsed, it does not
update.

