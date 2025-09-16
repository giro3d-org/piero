import { describe, expect, it, vitest } from 'vitest';

import type { Configuration } from '@/types/Configuration';

import loader, { registerLoader } from './loader';

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

            const customLoader = vitest.fn().mockReturnValue({ type: 'cityjson' });
            registerLoader('cityjson', customLoader);
            registerLoader('city.json', customLoader);

            const dataset = await loader.importFile(file, defaultConfig);

            expect(dataset.type).toBe('cityjson');
            expect(customLoader).toHaveBeenCalledOnce();
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

            const customLoader = vitest.fn().mockReturnValue({ type: 'ifc' });
            registerLoader('ifc', customLoader);

            const dataset = await loader.importFile(file, defaultConfig);

            expect(dataset.type).toBe('ifc');
            expect(customLoader).toHaveBeenCalledOnce();
        });
    });
});
