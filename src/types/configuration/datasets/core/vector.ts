import { DatasetType } from '..';
import { VectorSourceAsLayerConfig, VectorSourceAsMeshConfig } from '../../sources/core/vector';
import {
    DatasetConfigBase,
    DatasetConfigBaseWithSource,
    DatasetConfigBaseWithSources,
    DatasetSourceConfigBase,
} from './baseConfig';

export interface VectorAsMeshDatasetConfigBase<
    TDatasetType extends DatasetType,
    TSourceConfigType extends DatasetSourceConfigBase<TDatasetType> & VectorSourceAsMeshConfig,
> extends DatasetConfigBase<TDatasetType>,
        DatasetConfigBaseWithSources<TDatasetType, TSourceConfigType> {
    loadAsOverlay?: never;
}

export interface VectorAsLayerDatasetConfigBase<
    TDatasetType extends DatasetType,
    TSourceConfigType extends DatasetSourceConfigBase<TDatasetType> & VectorSourceAsLayerConfig,
> extends DatasetConfigBase<TDatasetType>,
        DatasetConfigBaseWithSource<TDatasetType, TSourceConfigType> {
    loadAsOverlay: true;
}
