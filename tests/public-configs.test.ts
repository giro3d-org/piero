import { Configuration } from '@giro3d/piero';
import { describe, expect, it } from 'vitest';

import demo from '../app/public/demo.json';

describe('demo.json', () => {
    it('should be valid', () => {
        expect(() => Configuration.parse(demo)).not.toThrow();
    });
});
