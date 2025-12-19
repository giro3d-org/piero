import type { Module, PieroContext } from '@giro3d/piero';

import GeohashSearchProvider from './GeohashSearchProvider';

export default class GeohashGeocoder implements Module {
    public readonly id = 'plugin-search-geohash';
    public readonly name = 'Geohash';

    public initialize(context: PieroContext): Promise<void> | void {
        context.search.registerProvider(new GeohashSearchProvider());
    }
}
