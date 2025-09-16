/**
 * CRS name.
 *
 * Requires the CRS to be registered in [`src/services/Giro3DManager.ts`](../services/Giro3DManager.ts)
 * @example `EPSG:2154`
 * @example `IGNF:WGS84G`
 */
export type CRS = string;

export interface Vec2 {
    x: number;
    y: number;
}

/**
 * 2D Position
 *
 * If the CRS is not provided, we use `default_crs`
 *
 * @example `{ crs: 'EPSG:2154', x: 842022, y: 6516602 }`
 */
export interface GeoVec2 extends Vec2 {
    crs?: CRS;
}

export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

/**
 * 3D Position
 *
 * If the CRS is not provided, we use `default_crs`
 *
 * @example `{ crs: 'EPSG:2154', x: 842022, y: 6516602, z: 725 }`
 */
export interface GeoVec3 extends Vec3 {
    crs?: CRS;
}

/**
 * Extent
 *
 * If the CRS is not provided, we use `default_crs`
 *
 * @example `{ crs: 'EPSG:2154', west: -111629.52, east: 1275028.84, south: 5976033.79, north: 7230161.64 }`
 */
export interface GeoExtent {
    crs?: string;
    west: number;
    east: number;
    south: number;
    north: number;
}
