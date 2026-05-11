# Attribution <Badge type="info" text="@giro3d/piero" />

<!---
This file was auto-generated from module-doc-template.md. Do not edit it manually !
-->

Add a widget to display copyright/attribution information.



## Usage with [`createPieroApp`](../create-piero-app.md)

```js
import { misc } from '@giro3d/piero/modules';

createPieroApp({
    ...
    modules: [
        misc.Attribution
        ...
    ]
})
```


## Usage

This module adds a widget in the bottom left of the main view to display copyright information and dataset attribution.

> [!note]
> Only visible datasets with a non-empty `attribution` field will be displayed in the attribution area.

