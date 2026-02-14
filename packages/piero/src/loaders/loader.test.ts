import { describe, expect, it, vitest } from 'vitest';

import type { Configuration } from '@/configuration/configuration';

import loader, { registerLoader } from './loader';

const defaultConfig = {} as Configuration;

describe('importFile', () => {
    describe('should return the correct dataset type', () => {
        it.each(['.abc'])('%s', async ext => {
            const file = new File([], `foo${ext}`);

            const customLoader = vitest.fn().mockReturnValue({ type: 'abc' });
            registerLoader('abc', customLoader);

            const dataset = await loader.importFile(file, defaultConfig);

            expect(dataset.type).toBe('abc');
            expect(customLoader).toHaveBeenCalledOnce();
        });
    });
});
