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
                crs: 'EPSG:3857',
                basemap: {
                    extent: [0, 0, 100, 100],
                },
                camera: {
                    latitude: 12,
                    longitude: 3.4,
                    heading: 34,
                    altitude: 20000,
                    tilt: -78,
                },
            },
        };

        const withDefaults = Configuration.parse(configuration);

        expect(withDefaults.scene.crs).toEqual('EPSG:3857');
        expect(withDefaults.scene.basemap).toBeDefined();
        expect(withDefaults.modules).toBeUndefined();
        expect(withDefaults.data).toHaveLength(0);
        expect(withDefaults.annotations).toHaveLength(0);
        expect(withDefaults.bookmarks).toHaveLength(0);
        expect(withDefaults.crsDefinitions).toHaveLength(0);
        expect(withDefaults.scene.camera.latitude).toEqual(12);
        expect(withDefaults.scene.camera.longitude).toEqual(3.4);
        expect(withDefaults.scene.camera.altitude).toEqual(20000);
        expect(withDefaults.scene.basemap.extent).toEqual([0, 0, 100, 100]);
    });
});
