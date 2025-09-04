import type { Vec3 } from '@/types/configuration/geographic';

/**
 * Bookmark configuration.
 *
 * The easiest way to define a bookmark is actually to set it in the app, export it and copy the values from the JSON file.
 */
export interface BookmarkConfig {
    /** Name of the bookmark displayed in the UI */
    title: string;
    /** 3D position of the camera, in `default_crs` */
    position: Vec3;
    /** 3D position of the camera target, in `default_crs` */
    target: Vec3;
    /** Focal offset of the camera */
    focalOffset: Vec3;
}
