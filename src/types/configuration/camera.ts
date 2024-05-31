import type { GeoVec2, GeoVec3 } from '@/types/configuration/geographic';

/**
 * Deprecated camera configuration
 *
 * @deprecated - Use CameraConfig instead. Will be removed in release v24.7.
 */
export interface CameraConfigDeprecated {
    /** Initial camera position */
    position: GeoVec2 | [number, number];
    /** Initial camera altitude */
    altitude: number;
}

/** Camera configuration */
export interface CameraConfig {
    /** Initial camera position */
    position: GeoVec3;
    /** Initial camera target - if not provided, will use the center of the extent */
    lookAt?: GeoVec3;
}
