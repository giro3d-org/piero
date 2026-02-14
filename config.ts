import type { configuration } from '@giro3d/piero';

const config: configuration.Configuration = {
    annotations: [],
    bookmarks: [],
    data: [],
    scene: {
        basemap: {
            extent: {
                crs: 'EPSG:3857',
                maxx: 100000,
                maxy: 100000,
                minx: -100000,
                miny: -100000,
            },
        },
        camera: {
            altitude: 0,
            heading: 0,
            latitude: 0,
            longitude: 0,
            tilt: -90,
        },
        crs: 'EPSG:3857',
    },
    version: 2,
};

export default config;
