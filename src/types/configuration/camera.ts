import { GeoVec2, GeoVec3 } from './geographic';

/**
 * Deprecated camera configuration
 *
 * @deprecated
 */
export type CameraConfigDeprecated = {
    /** Initial camera position */
    position: GeoVec2 | [number, number];
    /** Initial camera altitude */
    altitude: number;
};

/** Camera configuration */
export type CameraConfig = {
    /** Initial camera position */
    position: GeoVec3;
    /** Initial camera target - if not provided, will use the center of the extent */
    lookAt?: GeoVec3;
};
