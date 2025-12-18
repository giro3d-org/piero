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
    const modules = [
        // Misc modules
        new misc.Attribution(),
        new misc.Tour(),
        new misc.DownloadDataset(),
        new misc.PostProcessEntities(),
        new misc.OpenLayersMinimap(),
        new misc.Graticule(),

        // Built-in data loaders
        new loaders.LASLoader(),
        new loaders.KMLLoader(),
        new loaders.GPXLoader(),
        new loaders.GeoJSONLoader(),
        new loaders.IFCLoader(),
        new loaders.OSMLoader(),
        new loaders.TMSLoader(),
        new loaders.WMSLoader(),
        new loaders.WMTSLoader(),
        new loaders.GeoTIFFLoader(),
        new loaders.Tiles3DLoader(),

        // Non-standard loaders
        new loaders.MapboxLoader(),
        new loaders.PotreeLoader(),
        new loaders.BDTopoLoader(),

        // Data loaders provided by external packages
        new CityJSONLoader(),

        // Analysis tools
        new analysis.FloodingPlane(),
        // new analysis.ClippingBox(),
        new analysis.CrossSection(),

        // Search
        new search.CoordinatesSearch(),
        new search.FrenchBanGeocoder(),
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
