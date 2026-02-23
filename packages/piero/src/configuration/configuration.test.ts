/* eslint-disable perfectionist/sort-objects */
import { describe, expect, it } from 'vitest';
import z from 'zod';

import type { Bookmark } from './bookmark';
import type { DatasetOrGroup } from './dataset';

import { Configuration, ConfigurationBuilder } from './configuration';

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

describe('ConfigurationBuilder', () => {
    it('withCrsDefinitions', () => {
        const definitions = [
            {
                name: 'foo',
                definition: 'the foo def',
            },
            {
                name: 'bar',
                definition: 'the bar def',
            },
        ];

        const config = new ConfigurationBuilder().withCrsDefinitions([...definitions]).build();

        expect(config.crsDefinitions).toEqual(definitions);
    });

    it('withCrsDefinitions', () => {
        const bookmarks: Bookmark[] = [
            {
                title: 'bookmark 1',
                lookAt: {
                    heading: 10,
                    altitude: 1000,
                    latitude: 10.24,
                    longitude: 1014.2442,
                    tilt: 0,
                },
            },
            {
                title: 'bookmark 2',
                lookAt: {
                    heading: 13,
                    altitude: 1000,
                    latitude: 10.24,
                    longitude: 1014.2442,
                    tilt: 0,
                },
            },
        ];

        const config = new ConfigurationBuilder().withBookmarks(bookmarks).build();

        expect(config.bookmarks).toEqual(bookmarks);
    });

    it('withDatasets', () => {
        const datasets: DatasetOrGroup[] = [
            {
                name: 'folder 1',
                type: 'group',
            },
            {
                name: 'bar',
                type: 'foo',
                attribution: 'hello',
            },
        ];

        const config = new ConfigurationBuilder().withDatasets(datasets).build();

        const expected: DatasetOrGroup[] = [
            {
                name: 'folder 1',
                type: 'group',
                visible: false,
                opacity: 1,
            },
            {
                name: 'bar',
                type: 'foo',
                attribution: 'hello',
                visible: false,
                opacity: 1,
            },
        ];

        expect(config.data).toEqual(expected);
    });
});
