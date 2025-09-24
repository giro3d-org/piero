/* eslint-disable perfectionist/sort-objects */
import { describe, expect, it } from 'vitest';
import z from 'zod';

import { Configuration } from './Configuration';

describe('Configuration', () => {
    it('should generate JSON schema', () => {
        expect(() => z.toJSONSchema(Configuration)).not.toThrow();
    });

    it('should support minimal defaults', () => {
        const configuration: Configuration = {
            version: 2,
            scene: {
                camera: {
                    position: [0, 0, 0],
                },
            },
        };

        const withDefaults = Configuration.parse(configuration);

        expect(withDefaults.scene.crs).toEqual('EPSG:3857');
        expect(withDefaults.scene.basemap).toBeUndefined();
        expect(withDefaults.modules).toBeUndefined();
        expect(withDefaults.crsDefinitions).toHaveLength(0);
        expect(withDefaults.scene.camera.lookAt).toEqual([0, 0, 0]);

        console.log(JSON.stringify(withDefaults, null, 4));
    });

    it('TEMP', () => {
        const conf: Configuration = {
            version: 2,
            crsDefinitions: [
                {
                    name: 'EPSG:2154',
                    definition:
                        '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
                },
            ],
            scene: {
                crs: 'EPSG:2154',
                basemap: {
                    extent: [-100, -100, +100, +100],
                },
                camera: {
                    position: [0, 0, 0],
                },
            },
            modules: {
                lithojson: {
                    symbology: {
                        aA: { color: '#203233' },
                    },
                },
            },
        };

        console.log(JSON.stringify(conf, null, 2));
    });
});
