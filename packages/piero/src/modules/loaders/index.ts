/**
 * Modules that can load datasets.
 *
 * @packageDocumentation
 */

import BDTopoLoader from './BDTopoLoader';
import GeoJSON from './GeoJSON';
import GeoTIFF from './GeoTIFF';
import GPX from './GPX';
import IFC from './IFC';
import KML from './KML';
import LAS from './LAS';
import Mapbox from './Mapbox';
import OSM from './OSM';
import Potree from './Potree';
import Tiles3D from './Tiles3D';
import TMS from './TMS';
import WMS from './WMS';
import WMTS from './WMTS';

/**
 * Contains all loader modules.
 */
const all = [
    GeoJSON,
    GeoTIFF,
    GPX,
    IFC,
    KML,
    LAS,
    OSM,
    Tiles3D,
    TMS,
    WMS,
    WMTS,
    Mapbox,
    Potree,
    BDTopoLoader,
];

export {
    all,
    BDTopoLoader,
    GeoJSON,
    GeoTIFF,
    GPX,
    IFC,
    KML,
    LAS,
    Mapbox,
    OSM,
    Potree,
    Tiles3D,
    TMS,
    WMS,
    WMTS,
};
