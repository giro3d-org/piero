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

export default {
    // Standard formats
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

    // Provider or application-specific loaders
    MapboxLoader,
    PotreeLoader,

    // Region-specific loaders
    BDTopoLoader,
};
