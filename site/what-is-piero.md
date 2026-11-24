# What is Piero ?

Piero is a free and open source (FOSS) project to view and analyze 3D geospatial data on the web.

It is both **an app** and a Javascript **library** ([`@giro3d/piero`](https://www.npmjs.com/package/@giro3d/piero)).

> [!tip]
> When to use the app and the library ? If you don't want to customize your own deployment of Piero,
> use the app version. If you want to specify your own modules and theme, use the library.

> [!note]
> The demo application is available at <https://piero.giro3d.org/demo/>.

## Capabilities

### Supported data sources

Piero is able to load a broad range of data sources, such as vector and raster data, point clouds,
3D Tiles, and much more. Each data source is implemented as a [module](./modules.md), and it is very easy to extend
Piero to support your own datasets (or replace the default implementation for a data type).

#### Geographic vector data

- GeoJSON
- KML
- GPX

#### Raster data

- TMS
- WMTS
- WMS
- OpenStreetMap
- Mapbox tilesets (requires a Mapbox API key)
- GeoTIFF

#### 3D data

- 3D Tiles
- LAS/LAZ point clouds
- Potree point clouds
- glTF
- OBJ
- IFC
- CityJSON

### Search and geocoding

Piero is able to search through various geocoders, such as :

- French address database (BAN)
- Photon Geocoder

## Architecture

Piero is structured in a modular way with modern libraries.

### 3D view

This is the core component of the Piero app. The 3D view displays the scene in any coordinate
reference system (CRS) supported by [proj4.js](https://proj4js.org/).

Piero uses [Giro3D](https://giro3d.org/giro3d.html) and [three.js](https://threejs.org/) to render the scene.

### UI components

The UI is provided by [Vue](https://vuejs.org/) components.

### Styling, theming and layout

This part uses [Bootstrap](https://getbootstrap.com/) and works in coordination with Vue components
to render the app in predictable and flexible layouts, as well as support for dark/light color modes.

### Additional libraries

Some modules use additional libraries. For example, the `Minimap` module uses
[OpenLayers](https://openlayers.org), and `@giro3d/piero-plugin-cityjson` uses the [`cityjson-threejs-loader`](https://www.npmjs.com/package/cityjson-threejs-loader). Check the dependencies inthe plugin's `package.json` to get the list of used dependencies.
