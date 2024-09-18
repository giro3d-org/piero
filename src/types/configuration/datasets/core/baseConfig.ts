import type Entity3D from '@giro3d/giro3d/entities/Entity3D';

import type {
    SourceConfigElevationMixin,
    SourceConfigLocationMixin,
    SourceConfigProjectionMixin,
} from '@/types/configuration/sources/core/baseConfig';
import type { DatasetOrGroup } from '@/types/Dataset';

/**
 * Callback which is called when the dataset is preloaded into the app.
 *
 * This can be useful for post-processing your data (transformation, rotation, etc.).
 *
 * @param dataset - Dataset created
 * @param entity - Giro3D entity created
 */
export type OnObjectPreloaded = (dataset: DatasetOrGroup, entity: Entity3D) => void;

/** Base configuration for all dataset sources */
export interface DatasetSourceConfigBase<TDatasetType extends string> {
    type: TDatasetType;
}

/** Base configuration for all datasets */
export interface DatasetConfigBase<TDatasetType extends string> {
    type: TDatasetType;
    name: string;
    visible?: boolean;
    opacity?: number;
    onObjectPreloaded?: OnObjectPreloaded;
}

/** Base configuration for datasets that require a source */
export interface DatasetConfigWithSourceBase<
    TDatasetType extends string,
    TSourceConfigType extends DatasetSourceConfigBase<TDatasetType>,
> extends DatasetConfigBase<TDatasetType> {
    source: TSourceConfigType;
}

/** Base configuration for datasets that require one or multiple sources */
export interface DatasetConfigWithSourcesBase<
    TDatasetType extends string,
    TSourceConfigType extends DatasetSourceConfigBase<TDatasetType>,
> extends DatasetConfigBase<TDatasetType> {
    source: TSourceConfigType | TSourceConfigType[];
}

/** Mixin configuration for datasets that support masking the basemap */
export interface DatasetConfigMaskingMixin {
    canMaskBasemap?: boolean;
    isMaskingBasemap?: boolean;
}

/** Configuration that can be set on groups and cascade to children */
export interface DatasetCascadingConfig
    extends SourceConfigProjectionMixin,
        SourceConfigLocationMixin,
        SourceConfigElevationMixin {}
