import BDTopoLoader from './BDTopoLoader';
import GeoJSONLoader from './GeoJSONLoader';
import GeoTIFFLoader from './GeoTIFFLoader';
import GPXLoader from './GPXLoader';
import IFCLoader from './IFCLoader';
import KMLLoader from './KMLLoader';
import LASLoader from './LASLoader';
import MapboxLoader from './MapboxLoader';
import OSMLoader from './OSMLoader';
import PotreeLoader from './PotreeLoader';
import Tiles3DLoader from './Tiles3DLoader';
import TMSLoader from './TMSLoader';
import WMSLoader from './WMSLoader';
import WMTSLoader from './WMTSLoader';

const all = [
    GeoJSONLoader,
    GeoTIFFLoader,
    GPXLoader,
    IFCLoader,
    KMLLoader,
    LASLoader,
    OSMLoader,
    Tiles3DLoader,
    TMSLoader,
    WMSLoader,
    WMTSLoader,
    MapboxLoader,
    PotreeLoader,
    BDTopoLoader,
];

/**
 * Modules that can load datasets.
 */
export {
    all,
    BDTopoLoader,
    GeoJSONLoader,
    GeoTIFFLoader,
    GPXLoader,
    IFCLoader,
    KMLLoader,
    LASLoader,
    MapboxLoader,
    OSMLoader,
    PotreeLoader,
    Tiles3DLoader,
    TMSLoader,
    WMSLoader,
    WMTSLoader,
};
