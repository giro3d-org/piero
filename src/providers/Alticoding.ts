import type Instance from '@giro3d/giro3d/core/Instance';
import type Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import type Map from '@giro3d/giro3d/entities/Map';
import IgnProvider from './IgnProvider';

/**
 * Alticoder method
 */
export type Alticoder = (coordinates: Coordinates[]) => Promise<void>;

/**
 * Alticoder using {@link IgnProvider}.
 */
export const IgnAlticoder = IgnProvider.alticode;

/**
 * Alticoder generator using (only) the map
 *
 * @param instance - Giro3D instance
 * @returns Alticoder
 */
export const mapAlticoderGenerator = (instance: Instance): Alticoder => {
    const map = instance.getEntities(o => (o as Map).isMap).at(0) as Map | undefined;
    if (map == null) {
        throw new Error('No map attached to the instance');
    }

    const alticoder = async (coordinates: Coordinates[]): Promise<void> => {
        coordinates.forEach(coords => {
            const res = map
                .getElevation({ coordinates: coords })
                .samples.sort((a, b) => a.resolution - b.resolution)
                .at(0);
            if (res != null) {
                // @ts-expect-error Bypass isGeographic test as we don't care
                coords._values[2] = res.elevation;
            }
        });
    };
    return alticoder;
};

/**
 * Alticoder generator using multiple ones
 * @param alticoders - List of alticoders to use
 * @param noDataValue - No data value
 * @returns
 */
export const alticoders = (alticoders: Alticoder[], noDataValue = 0): Alticoder => {
    const alticoder = async (coordinates: Coordinates[]): Promise<void> => {
        // @ts-expect-error Bypass isGeographic test as we don't care
        let missingCoordinates = coordinates.filter(c => c._values[2] === noDataValue);
        for (const coder of alticoders) {
            await coder(missingCoordinates);
            // @ts-expect-error Bypass isGeographic test as we don't care
            missingCoordinates = missingCoordinates.filter(c => c._values[2] === noDataValue);
            if (missingCoordinates.length === 0) {
                // All done, exit early
                break;
            }
        }
    };
    return alticoder;
};

/**
 * Alticoder generator using the map if fast
 *
 * @param instance - Giro3D instance
 * @param fast - Fast alticoding
 * @returns Alticoder
 */
export const alticoderGenerator = (
    instance: Instance,
    fast: boolean,
    noDataValue = 0,
): Alticoder => {
    return fast
        ? alticoders([mapAlticoderGenerator(instance), IgnAlticoder], noDataValue)
        : IgnAlticoder;
};
