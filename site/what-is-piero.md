# What is Piero ?

Piero is a free and open source (FOSS) project to view and analyze 3D geospatial data on the web.

It is both **an app** and a **library** (`@giro3d/piero`).

> [!tip]
> When to use the app and the library ? If you don't want to customize your own deployment of Piero,
> use the app version. If you want to specify your own modules and theme, use the library.

> [!note]
> The demo application is available at <https://piero.giro3d.org/>.

## Capabilities

Piero is able to load a broad range of data sources, such as vector and raster data, point clouds,
3D Tiles, and much more. Each data source is implemented as a [module](./modules.md), and it is very easy to extend
Piero to support your own datasets (or replace the default implementation for a data type).

### Geographic vector data

- GeoJSON
- KML
- GPX

### Raster data

- TMS
- WMTS
- WMS
- OpenStreetMap
- Mapbox tilesets (requires a Mapbox API key)
- GeoTIFF

### 3D data

- 3D Tiles
- LAS/LAZ point clouds
- Potree point clouds
- glTF
- OBJ
- IFC
- CityJSON

## Search and geocoding

Piero is able to search through various geocoders, such as :

- French address database (BAN)
- Photon Geocoder
