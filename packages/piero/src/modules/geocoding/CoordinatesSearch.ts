import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';

import type { SearchProvider, SearchResult } from '@/api';
import type { LocationSearchResult } from '@/api/SearchApi';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

const latLonDd = /^(\d+\.\d+)\s*,\s*(\d+\.\d+)$/;

class CoordinatesSearchProvider implements SearchProvider {
    public readonly name = 'Go to coordinates';

    public search(query: string): Promise<SearchResult[]> {
        const results = latLonDd.exec(query);

        if (results) {
            const lat = Number.parseFloat(results[1]);
            const lon = Number.parseFloat(results[2]);

            const coordinates = Coordinates.WGS84(lat, lon);

            const result: LocationSearchResult = {
                coordinates,
                label: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
                provider: this,
            };

            return Promise.resolve([result]);
        } else {
            return Promise.resolve([]);
        }
    }
}

export default class CoordinatesSearch implements Module {
    public readonly id = 'builtin-coordinates-search';
    public readonly name = 'Coordinates search';

    public initialize(context: PieroContext): Promise<void> | void {
        context.search.registerProvider(new CoordinatesSearchProvider());
    }
}
