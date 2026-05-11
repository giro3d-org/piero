# CoordinatesSearch <Badge type="info" text="@giro3d/piero" />

<!---
This file was auto-generated from module-doc-template.md. Do not edit it manually !
-->

Search geographic coordinates.



## Usage with [`createPieroApp`](../create-piero-app.md)

```js
import { search } from '@giro3d/piero/modules';

createPieroApp({
    ...
    modules: [
        search.CoordinatesSearch
        ...
    ]
})
```


## Usage

This module enables typing geographic coordinates in the search bar. For example, typing `43.68019855603657, 1.2889447259129847` will return a search result matching this geographic location. Clicking on this result will then go to this coordinate on the basemap.

