import type { GeoVec2, GeoVec3, Vec3 } from '@/types/configuration/geographic';

export interface AnalysisConfig {
    /** Cross section configuration */
    cross_section: {
        /** Default pivot point */
        pivot: GeoVec2;
        /** Default orientation in degrees of the cross section plane */
        orientation: number;
    };
    /** Clipping box configuration */
    clipping_box: {
        /** Default center of the clipping box */
        center: GeoVec3;
        /** Default size of the clipping box */
        size: Vec3;
        /** Default settings for floor presets */
        floor_preset: {
            /** Altitude of the ground of floor 0 */
            altitude: number;
            /** Height of a floor */
            size: number;
            /** Default floor number */
            floor: number;
        };
    };
}
