import type { ModuleConstructor, PieroApplication } from '@giro3d/piero';

import { createPieroApp, loadRemoteConfiguration } from '@giro3d/piero';
import { CityJSONLoader } from '@giro3d/piero-plugin-cityjson';
import { GeohashGeocoder } from '@giro3d/piero-plugin-geohash';
import { analysis, loaders, misc, search } from '@giro3d/piero/modules';

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

async function start(): Promise<PieroApplication> {
    // Piero can either load a remote configuration from the provided 'config' URL param
    // i.e: http://piero.giro3d.org?config=my-remote-configuration.json
    // or load the static configuration file (config.ts) in the same folder as this file.
    const params = new URLSearchParams(document.location.search);
    const configurationUrl = params.get('config');
    let configuration = 'demo.json';
    let fallback = false;

    if (configurationUrl != null) {
        try {
            configuration = await loadRemoteConfiguration(configurationUrl);
        } catch (e) {
            console.warn(`Failed to fetch configuration from ${configurationUrl}`, e);
            fallback = true;
        }
    }

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
        analysis.ClippingBox,

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

    // We are now ready to instantiate Piero on the #app DOM element of our webpage.*
    const app = await createPieroApp({
        baseUrl: env.baseUrl,
        configuration,
        container: '#app',
        modules,
    });
    if (fallback) {
        console.warn('Piero instantiated with default configuration.', app);
        app.context.notifications.warning(
            app.context.configuration.title ?? 'Configuration',
            'Could not use provided configuration, loaded default configuration instead.',
        );
    } else {
        console.info('Piero instantiated successfully.', app);
        app.context.notifications.success(
            app.context.configuration.title ?? 'Configuration',
            'Loading successful.',
        );
    }
    return app;
}

start()
    .then(app => {
        const configName = app.context.configuration.title;
        if (configName != null) {
            document.title = `${configName} · ${env.title}`;
        } else {
            document.title = env.title;
        }
    })
    .catch(e => {
        console.error('Failed to instanciate Piero', e);
    });
