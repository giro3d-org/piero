import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';

const tmpCoords = new Coordinates('EPSG:4326', 0, 0, 0);

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

        const requestAltitude = await fetch(
            `https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json?lon=${lng.join(
                '|',
            )}&lat=${lat.join('|')}&zonly=true&resource=ign_rge_alti_wld&delimiter=|&indent=false`,
        );
        const altitude = await requestAltitude.json();
        altitude.elevations.forEach((value: number, i: number) => {
            coordinates[i].setAltitude(value);
        });
    },
};
