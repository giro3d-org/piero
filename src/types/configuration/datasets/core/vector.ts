import type { DatasetType } from '@/types/configuration/datasets';
import type {
    VectorAsLayerSourceConfigMixin,
    VectorAsMeshSourceConfigMixin,
} from '@/types/configuration/sources/core/vector';
import type {
    DatasetAsLayerConfigMixin,
    DatasetConfigWithSourceBase,
    DatasetConfigWithSourcesBase,
    DatasetSourceConfigBase,
} from './baseConfig';

/** Base configuration for datasets that can be loaded as meshes */
export interface VectorAsMeshDatasetConfigBase<
    TDatasetType extends DatasetType,
    TSourceConfigType extends DatasetSourceConfigBase<TDatasetType> & VectorAsMeshSourceConfigMixin,
> extends DatasetConfigWithSourcesBase<TDatasetType, TSourceConfigType> {
    loadAsOverlay?: never;
}

/** Base configuration for datasets that can be loaded as Giro3D layers */
export interface VectorAsLayerDatasetConfigBase<
    TDatasetType extends DatasetType,
    TSourceConfigType extends DatasetSourceConfigBase<TDatasetType> &
        VectorAsLayerSourceConfigMixin,
> extends DatasetConfigWithSourceBase<TDatasetType, TSourceConfigType>,
        DatasetAsLayerConfigMixin {}
