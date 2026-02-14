import type { FeatureCollection, Point } from 'geojson';

import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import { HttpError } from '@giro3d/giro3d/utils/Fetcher';

import type { LocationSearchResult, SearchProvider } from '@/api/search';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import Fetcher from '@/utils/Fetcher';

const validationRegex = /[a-z]{3}/;

interface PhotonProperties {
    city?: string;
    country?: string;
    countrycode?: string;
    county?: string;
    district?: string;
    housenumber?: string;
    label?: string;
    locality?: string;
    name?: string;
    osm_id: number;
    osm_key?: string;
    osm_type?: string;
    osm_value?: string;
    postcode?: string;
    state?: string;
    street?: string;
    type?: string;
}

class PhotonSearchProvider implements SearchProvider<LocationSearchResult> {
    public readonly name = 'OpenStreetMap Photon';

    public async search(query: string): Promise<LocationSearchResult[]> {
        // Basic validation that the query could be applicable to us.
        if (!validationRegex.test(query)) {
            return [];
        }

        try {
            const data = await Fetcher.fetchJson<FeatureCollection>(
                `https://photon.komoot.io/api/?q=${query}`,
            );

            const result: LocationSearchResult[] = data.features.map(f => {
                const props = f.properties as PhotonProperties;
                const point = f.geometry as Point;
                const [x, y] = point.coordinates;

                return {
                    coordinates: new Coordinates('EPSG:4326', x, y, 0),
                    label: formatLabel(props),
                    provider: this,
                } satisfies LocationSearchResult;
            });

            return result;
        } catch (e) {
            if (e instanceof HttpError) {
                return [];
            }
            throw e;
        }
    }
}

function formatLabel(properties: PhotonProperties): string {
    if (properties.label != null) {
        return properties.label;
    }

    const items: string[] = [];

    if (properties.housenumber != null) {
        items.push(properties.housenumber);
    }

    if (properties.street != null) {
        items.push(properties.street);
    }

    if (properties.city != null) {
        items.push(properties.city);
    }

    if (properties.country != null) {
        items.push(properties.country);
    }

    if (properties.postcode != null) {
        items.push(properties.postcode);
    }

    return items.join(', ');
}

/**
 * Provides geocoding capabilities from the Photon geocoder.
 */
export default class PhotonGeocoder implements Module {
    public readonly id = 'builtin-search-photon';
    public readonly name = 'OpenStreetMap Photon';

    public initialize(context: PieroContext): Promise<void> | void {
        context.search.registerProvider(new PhotonSearchProvider());
    }
}
