import Fetcher from '@/utils/Fetcher';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';

const tmpCoords = new Coordinates('EPSG:4326', 0, 0, 0);

type AltitudeResponse = {
    elevations: number[];
};

async function alticodeBatch(lngs: number[], lats: number[]): Promise<number[]> {
    const altitude = await Fetcher.fetchJson<AltitudeResponse>(
        `https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json?lon=${lngs.join(
            '|',
        )}&lat=${lats.join('|')}&zonly=true&resource=ign_rge_alti_wld&delimiter=|&indent=false`,
    );
    return altitude.elevations;
}

async function alticode(lngs: number[], lats: number[]): Promise<number[]> {
    const chunkSize = 200;
    const promises = [];
    for (let i = 0; i < lngs.length; i += chunkSize) {
        const chunkLng = lngs.slice(i, i + chunkSize);
        const chunkLat = lats.slice(i, i + chunkSize);
        promises.push(alticodeBatch(chunkLng, chunkLat));
    }

    const res = await Promise.all(promises);
    return res.flat();
}

export default {
    /**
     * Fetches altitudes from IGN Alti service.
     * Will fill the `altitude` component of each coordinates.
     *
     * @param coordinates - Coordinates to fetch altitudes for
     */
    async alticode(coordinates: Coordinates[]): Promise<void> {
        const lng: number[] = [];
        const lat: number[] = [];

        coordinates.forEach(c => {
            c.as('EPSG:4326', tmpCoords);
            lng.push(tmpCoords.longitude);
            lat.push(tmpCoords.latitude);
        });

        const altitude = await alticode(lng, lat);
        altitude.forEach((value: number, i: number) => {
            // @ts-expect-error Bypass isGeographic test as we don't care
            coordinates[i]._values[2] = value;
        });
    },
};
