import type {
    SourceConfigLocationMixin,
    SourceConfigUrlOrDataMixin,
} from '@/types/configuration/sources/core/baseConfig';
import type { DatasetConfigWithSourceBase, DatasetSourceConfigBase } from './core/baseConfig';

/** PLY source configuration */
export interface PLYDatasetSourceConfig
    extends DatasetSourceConfigBase<'ply'>,
        SourceConfigUrlOrDataMixin,
        Required<SourceConfigLocationMixin> {}

/** PLY dataset configuration */
export interface PLYDatasetConfig
    extends DatasetConfigWithSourceBase<'ply', PLYDatasetSourceConfig> {}
