import { describe, expect, it } from 'vitest';

import type { Configuration } from '@/types/Configuration';

import loader from './loader';

const defaultConfig = {} as Configuration;

describe('importFile', () => {
    describe('should return the correct dataset type', () => {
        it.each(['.geo.json', '.geojson'])('%s', async ext => {
            const file = new File([], `foo${ext}`);

            const dataset = await loader.importFile(file, defaultConfig);

            expect(dataset.type).toBe('vector');
        });
        it.each(['.city.json', '.cityjson'])('%s', async ext => {
            const file = new File([], `foo${ext}`);

            const dataset = await loader.importFile(file, defaultConfig);

            expect(dataset.type).toBe('cityjson');
        });
        it.each(['.gpx', '.kml', '.gpkg'])('%s', async ext => {
            const file = new File([], `foo${ext}`);

            const dataset = await loader.importFile(file, defaultConfig);

            expect(dataset.type).toBe('vector');
        });
        it.each(['.las', '.laz', '.copc.laz'])('%s', async ext => {
            const file = new File([], `foo${ext}`);

            const dataset = await loader.importFile(file, defaultConfig);

            expect(dataset.type).toBe('flatPointcloud');
        });
        it.each(['.csv', '.dsv', '.tsv'])('%s', async ext => {
            const file = new File([], `foo${ext}`);

            const dataset = await loader.importFile(file, defaultConfig);

            expect(dataset.type).toBe('flatPointcloud');
        });
        it.each(['.ifc'])('%s', async ext => {
            const file = new File([], `foo${ext}`);

            const dataset = await loader.importFile(file, defaultConfig);

            expect(dataset.type).toBe('ifc');
        });
    });
});
