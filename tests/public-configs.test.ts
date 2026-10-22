import { describe, expect, it } from 'vitest';

import { Configuration } from '../packages/piero/src/configuration/configuration';
import demo from '../public/demo.json';

describe('demo.json', () => {
    it('should be valid', () => {
        expect(() => Configuration.parse(demo)).not.toThrow();
    });
});
