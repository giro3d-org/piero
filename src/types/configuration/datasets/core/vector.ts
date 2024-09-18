import { DatasetType } from '..';
import { SourceConfigBase } from '../../sources/core/baseConfig';
import { VectorSourceAsMeshConfig } from '../../sources/core/vector';
import { DatasetConfigBase } from './baseConfig';

export interface VectorDatasetSourceConfigBase<TType extends DatasetType>
    extends SourceConfigBase<TType>,
        VectorSourceAsMeshConfig {}

export interface VectorDatasetConfigBase<TType extends DatasetType>
    extends DatasetConfigBase<TType> {
    sources: VectorDatasetSourceConfigBase<TType> | VectorDatasetSourceConfigBase<TType>[];
}
