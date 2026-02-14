import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import Geohash from 'latlon-geohash';

const validationRegex = /^[0-9bcdefghjkmnpqrstuvwxyz]{3,12}$/;

export default class GeohashSearchProvider implements SearchProvider<LocationSearchResult> {
    public readonly name = 'Geohash';

    public async search(query: string): Promise<LocationSearchResult[]> {
        // Basic validation that the query could be applicable to us.
        if (!validationRegex.test(query)) {
            return Promise.resolve([]);
        }

        try {
            const location = Geohash.decode(query);

            const coordinates = Coordinates.WGS84(location.lat, location.lon);

            const result: LocationSearchResult = {
                coordinates,
                label: `lat: ${location.lat}°, lon: ${location.lon}°`,
                provider: this,
            };

            return Promise.resolve([result]);
        } catch {
            return Promise.resolve([]);
        }
    }
}
