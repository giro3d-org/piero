import Fetcher from '@/utils/Fetcher';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import type { GeocodingResult } from './Geocoding';
import IgnProvider from './IgnProvider';

export default {
    /**
     * Searches for an address in the French BAN
     *
     * @param query - Search query
     * @returns Results
     */
    async geocode(query: string): Promise<GeocodingResult[]> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await Fetcher.fetchJson<any>(
            `https://api-adresse.data.gouv.fr/search/?q=${query}`,
        );

        const coordinates: Coordinates[] = data.features.map(
            (feature: { geometry: { coordinates: [number, number] } }) =>
                new Coordinates(
                    'EPSG:4326',
                    feature.geometry.coordinates[0],
                    feature.geometry.coordinates[1],
                    0,
                ),
        );
        await IgnProvider.alticode(coordinates);

        coordinates.forEach((c, i) => {
            // Here we have EPSG:2154 coordinates, which are not the same as in feature.geometry!
            data.features[i].properties.crs = 'EPSG:2154';
            data.features[i].properties.z = c.altitude;
        });
        return data.features.map((f: { properties: object }) => f.properties);
    },
};
