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

export interface DatasetSourceConfigBase<TDatasetType extends string> {
    type: TDatasetType;
}

export interface DatasetConfigBase<TDatasetType extends string> {
    type: TDatasetType;
    name: string;
    visible?: boolean;
    opacity?: number;
    onObjectPreloaded?: OnObjectPreloaded;
}

export interface DatasetConfigBaseWithSource<
    TDatasetType extends string,
    TSourceConfigType extends DatasetSourceConfigBase<TDatasetType>,
> extends DatasetConfigBase<TDatasetType> {
    source: TSourceConfigType;
}

export interface DatasetConfigBaseWithSources<
    TDatasetType extends string,
    TSourceConfigType extends DatasetSourceConfigBase<TDatasetType>,
> extends DatasetConfigBase<TDatasetType> {
    sources: TSourceConfigType | TSourceConfigType[];
}

export interface DatasetSourceConfigUrl {
    url: string;
}

export interface DatasetSourceConfigUrlOrData {
    url: UrlOrData;
}

/** CRS of the source - must be registered first */
export interface DatasetSourceConfigDataProjection {
    dataProjection?: CRS;
}

export interface DatasetSourceConfigLocation {
    position?: GeoVec3;
}

export interface DatasetConfigWithMasking {
    canMaskBasemap?: boolean;
    isMaskingBasemap?: boolean;
}

export interface DatasetSourceConfigElevation {
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
    extends DatasetSourceConfigDataProjection,
        DatasetSourceConfigLocation,
        DatasetSourceConfigElevation {}
