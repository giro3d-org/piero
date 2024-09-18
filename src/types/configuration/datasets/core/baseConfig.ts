import type { UrlOrData } from '@/utils/Fetcher';
import type { CRS, GeoVec3 } from '../../geographic';
import type { DatasetOrGroup } from '@/types/Dataset';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';

/**
 * Callback which is called when the dataset is preloaded into the app.
 *
 * This can be useful for post-processing your data (transformation, rotation, etc.).
 *
 * @param dataset - Dataset created
 * @param entity - Giro3D entity created
 */
export type OnObjectPreloaded = (dataset: DatasetOrGroup, entity: Entity3D) => void;

export interface DatasetConfigBase<TDatasetType extends string> {
    type: TDatasetType;
    name: string;
    visible?: boolean;
    opacity?: number;
    onObjectPreloaded?: OnObjectPreloaded;
}

export interface DatasetConfigWithSingleUrl {
    url: string;
}

export interface DatasetConfigWithMultipleUrl {
    url: string | string[];
}

export interface DatasetConfigWithSingleUrlOrData {
    url: UrlOrData;
}

export interface DatasetConfigWithMultipleUrlOrData {
    url: UrlOrData | UrlOrData[];
}

export interface DatasetConfigWithDataProjection {
    dataProjection?: CRS;
}

export interface DatasetConfigWithLocation {
    position?: GeoVec3;
}

export interface DatasetConfigWithMasking {
    canMaskBasemap?: boolean;
    isMaskingBasemap?: boolean;
}

export interface DatasetConfigWithElevation {
    /**
     * Elevation of data
     *
     * @defaultValue 0
     */
    elevation?: number;
    /**
     * Fetch elevation from provider
     *
     * @defaultValue false
     */
    fetchElevation?: boolean;
    /**
     * Fetch elevation only for centroids of features
     *
     * @defaultValue true
     */
    fetchElevationFast?: boolean;
}

export interface DatasetCascadingConfig
    extends DatasetConfigWithDataProjection,
        DatasetConfigWithLocation,
        DatasetConfigWithElevation {}
