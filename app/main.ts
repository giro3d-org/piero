import type { ModuleConstructor, PieroApplication } from '@giro3d/piero';

import { createPieroApp } from '@giro3d/piero';
import { CityJSONLoader } from '@giro3d/piero-plugin-cityjson';
import { GeohashGeocoder } from '@giro3d/piero-plugin-geohash';
import { analysis, loaders, misc, search } from '@giro3d/piero/modules';
import '@giro3d/piero/piero.css';

class Environment {
    public readonly baseUrl: string;
    public readonly title: string;

    public constructor() {
        this.baseUrl = import.meta.env.VITE_BASE_URL;
        this.title = import.meta.env.VITE_APP_TITLE ?? 'Piero';
    }
}

// Load the environment variables.
const env = new Environment();

function start(): Promise<PieroApplication> {
    // The list of all optional modules we want to use.
    // Since this is the default Piero app, we load all the modules
    // for demonstration purposes. However, in a customized Piero app,
    // you will want to select as few modules as possible for the best
    // performance and bundle size.
    const modules: ModuleConstructor[] = [
        /**
         * Miscellaneous modules
         */
        misc.Attribution,
        misc.Tour,
        misc.DownloadDataset,
        misc.PostProcessEntities,
        misc.OpenLayersMinimap,
        misc.Graticule,

        /**
         * Data loaders
         */

        // Built-in
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

        loaders.MapboxLoader,
        loaders.PotreeLoader,
        loaders.BDTopoLoader,

        // External plugins
        CityJSONLoader,

        /**
         * Analysis tools
         */
        analysis.FloodingPlane,
        analysis.CrossSection,

        /**
         * Search-related modules
         */
        // Built-in
        search.CoordinatesSearch,
        search.FrenchBanGeocoder,
        search.PhotonGeocoder,

        // External plugins
        GeohashGeocoder,
    ];

    // Piero can either load a remote configuration from the provided 'config' URL param
    // i.e: http://piero.giro3d.org?config=my-remote-configuration.json
    // or load the static configuration file (config.ts) in the same folder as this file.
    const params = new URLSearchParams(document.location.search);
    const configurationUrl = params.get('config');
    const configuration = configurationUrl ?? undefined;

    // We are now ready to instantiate Piero on the #app DOM element of our webpage.
    return createPieroApp({
        baseUrl: env.baseUrl,
        configuration,
        container: '#app',
        modules,
    });
}

start()
    .then(app => {
        console.info('Piero instantiated successfully.', app);
        app.context.notifications.success(
            app.context.configuration.title ?? 'Configuration',
            'Loading successful.',
        );

        const configName = app.context.configuration.title;
        if (configName != null) {
            document.title = `${configName} · ${env.title}`;
        } else {
            document.title = env.title;
        }
    })
    .catch(console.error);
