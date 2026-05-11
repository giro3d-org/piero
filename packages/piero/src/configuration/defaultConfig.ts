import type { Configuration } from '@giro3d/piero';

/**
 * A default, ultra-minimal configuration that displays the world in the Web Mercator
 * projection using an OpenStreetMap basemap (requires the OSMLoader built-in module).
 */
const config: Configuration = {
    data: [
        {
            attribution: '© OpenStreetMap contributors',
            name: 'OSM',
            type: 'osm',
            visible: true,
        },
    ],
    scene: {
        basemap: {
            extent: {
                crs: 'EPSG:3857',
                maxx: 20037508.342789244,
                maxy: 20037508.342789244,
                minx: -20037508.342789244,
                miny: -20037508.342789244,
            },
        },
        camera: {
            altitude: 80000000,
            heading: 0,
            latitude: 0,
            longitude: 0,
            tilt: -90,
        },
        crs: 'EPSG:3857',
    },
    title: 'Default configuration',
    version: 2,
};

export default config;
