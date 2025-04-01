import DefaultConfig from '@/config';
import Instance from '@giro3d/giro3d/core/Instance';
import type { Configuration } from './types/Configuration';
import Fetcher from './utils/Fetcher';

let config: Readonly<Configuration> | null = null;
let configInitializedPromise: Promise<unknown> | null = null;

export default function getConfig(): Readonly<Configuration> {
    if (!config) {
        if (configInitializedPromise) {
            throw new Error('Config not loaded yet');
        } else {
            throw new Error('Please call loadConfig() before calling getConfig().');
        }
    }
    return config;
}

export async function loadConfig(): Promise<void> {
    if (!configInitializedPromise) {
        configInitializedPromise = initializeConfig();
    }

    await configInitializedPromise;
}

async function initializeConfig(): Promise<void> {
    const retrievedConfig = await retrieveConfigJson();

    if (!retrievedConfig.crs_definitions) {
        console.warn(
            'Configuration is not specifying CRS definitions. You should define the projections you use. See https://gitlab.com/giro3d/piero/-/issues/78 for more information.',
        );

        retrievedConfig.crs_definitions = {
            'EPSG:2154':
                '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
            'EPSG:3857':
                '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs',
            'EPSG:3946':
                '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
            'EPSG:3948':
                '+proj=lcc +lat_0=48 +lon_0=3 +lat_1=47.25 +lat_2=48.75 +x_0=1700000 +y_0=7200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
            'EPSG:4171': '+proj=longlat +ellps=GRS80 +no_defs +type=crs',
            'EPSG:4326': '+proj=longlat +datum=WGS84 +no_defs +type=crs',
            'IGNF:WGS84G':
                'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]',
        };
    }

    for (const [name, definition] of Object.entries(retrievedConfig.crs_definitions)) {
        try {
            Instance.registerCRS(name, definition);
        } catch (error: unknown) {
            console.error(`Failed to register CRS "${name}" as "${definition}".`);
            throw error;
        }
    }

    config = retrievedConfig;
}

async function retrieveConfigJson(): Promise<Configuration> {
    const urlSearchParams = new URLSearchParams(document.location.search);
    const configUrl = urlSearchParams.get('config');
    if (configUrl !== null) {
        return await Fetcher.fetchJson(configUrl);
    } else {
        return DefaultConfig;
    }
}
