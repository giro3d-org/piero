import type { GeoVec2, GeoVec3, Vec3 } from '@/types/configuration/geographic';

export interface AnalysisConfig {
    /** Clipping box configuration */
    clipping_box: {
        /** Default center of the clipping box */
        center: GeoVec3;
        /** Default settings for floor presets */
        floor_preset: {
            /** Altitude of the ground of floor 0 */
            altitude: number;
            /** Default floor number */
            floor: number;
            /** Height of a floor */
            size: number;
        };
        /** Default size of the clipping box */
        size: Vec3;
    };
    /** Cross section configuration */
    cross_section: {
        /** Default orientation in degrees of the cross section plane */
        orientation: number;
        /** Default pivot point */
        pivot: GeoVec2;
    };
}
