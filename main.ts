import type { ModuleConstructor } from '@giro3d/piero';

import { createPieroApp } from '@giro3d/piero';
import { CityJSONLoader } from '@giro3d/piero-plugin-cityjson';
import { analysis, loaders, misc, search } from '@giro3d/piero/modules';

import DefaultConfig from './defaultConfig';

class Environment {
    public readonly baseUrl: string;
    public readonly title: string;

    public constructor() {
        this.baseUrl = import.meta.env.VITE_BASE_URL;
        this.title = import.meta.env.VITE_APP_TITLE;
    }
}

function start(): Promise<void> {
    // Load the environment variables.
    const env = new Environment();

    document.title = env.title;

    // The list of all optional modules we want to use.
    // Since this is the default Piero app, we load all the modules
    // for demonstration purposes. However, in a customized Piero app,
    // you will want to select as few modules as possible for the best
    // performance and bundle size.
    const modules: ModuleConstructor[] = [
        // Misc modules
        misc.Attribution,
        misc.Tour,
        misc.DownloadDataset,
        misc.PostProcessEntities,
        misc.OpenLayersMinimap,
        misc.Graticule,

        // Built-in data loaders
        loaders.LASLoader,
        loaders.KMLLoader,
        loaders.GPXLoader,
        loaders.GeoJSONLoader,
        loaders.IFCLoader,
        loaders.OSMLoader,
        loaders.TMSLoader,
        loaders.WMSLoader,
        loaders.WMTSLoader,
        loaders.GeoTIFFLoader,
        loaders.Tiles3DLoader,

        // Non-standard loaders
        loaders.MapboxLoader,
        loaders.PotreeLoader,
        loaders.BDTopoLoader,

        // Data loaders provided by external packages
        CityJSONLoader,

        // Analysis tools
        analysis.FloodingPlane,
        // analysis.ClippingBox,
        analysis.CrossSection,

        // Search
        search.CoordinatesSearch,
        search.FrenchBanGeocoder,
        search.PhotonGeocoder,
    ];

    // Piero can either load a remote configuration from the provided 'config' URL param
    // i.e: http://piero.giro3d.org?config=my-remote-configuration.json
    // or load the static configuration file (config.ts) in the same folder as this file.
    const params = new URLSearchParams(document.location.search);
    const configurationUrl = params.get('config');
    const configuration = configurationUrl ?? DefaultConfig;

    // We are now ready to instantiate Piero on the #app DOM element of our webpage.
    return createPieroApp({
        baseUrl: env.baseUrl,
        configuration,
        container: '#app',
        modules,
    });
}

start().catch(console.error);
