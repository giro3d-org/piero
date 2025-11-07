import type { FeatureCollection, Point } from 'geojson';

import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import { HttpError } from '@giro3d/giro3d/utils/Fetcher';

import type { SearchProvider } from '@/api';
import type { LocationSearchResult } from '@/api/SearchApi';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import Fetcher from '@/utils/Fetcher';

type AltitudeResponse = {
    elevations: number[];
};

const validationRegex = /[a-z]{3}/;

class BanSearchProvider implements SearchProvider<LocationSearchResult> {
    public readonly name = 'Base adresse nationale (BAN)';

    public async search(query: string): Promise<LocationSearchResult[]> {
        // Basic validation that the query could be applicable to us.
        if (!validationRegex.test(query)) {
            return [];
        }

        try {
            const data = await Fetcher.fetchJson<FeatureCollection>(
                `https://api-adresse.data.gouv.fr/search/?q=${query}`,
            );

            const result: LocationSearchResult[] = data.features.map(f => {
                const props = f.properties as Record<string, unknown>;
                const point = f.geometry as Point;
                const [x, y] = point.coordinates;

                return {
                    coordinates: new Coordinates('EPSG:4326', x, y, 0),
                    label: props.label as string,
                    provider: this,
                } satisfies LocationSearchResult;
            });

            await alticode(result.map(r => r.coordinates));

            return result;
        } catch (e) {
            if (e instanceof HttpError) {
                return [];
            }
            throw e;
        }
    }
}

async function alticode(coordinates: Coordinates[]): Promise<AltitudeResponse> {
    const url = new URL('https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json');

    url.searchParams.append('lon', coordinates.map(c => c.longitude).join('|'));
    url.searchParams.append('lat', coordinates.map(c => c.latitude).join('|'));
    url.searchParams.append('zonly', 'true');
    url.searchParams.append('resource', 'ign_rge_alti_wld');
    url.searchParams.append('delimiter', '|');
    url.searchParams.append('indent', 'false');

    const result = await Fetcher.fetchJson<AltitudeResponse>(url.toString());

    for (let i = 0; i < coordinates.length; i++) {
        const element = coordinates[i];
        element.setAltitude(result.elevations[i]);
    }

    return result;
}

/**
 * Provides geocoding capabilities from the french address database.
 */
export default class FrenchBanGeocoder implements Module {
    public readonly id = 'builtin-geocoding-ban';
    public readonly name = 'Base adresse nationale';

    public initialize(context: PieroContext): Promise<void> | void {
        context.search.registerProvider(new BanSearchProvider());
    }
}
