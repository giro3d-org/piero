import type { SourceConfigLocationMixin } from '@/types/configuration/sources/core/baseConfig';
import type { DatasetConfigBase } from './core/baseConfig';
import { PLYSource } from '@/giro3d/entities/PlyEntity';

/** PLY source configuration */
export interface PLYDatasetSourceConfig
    extends Omit<PLYSource, 'at'>,
        Required<SourceConfigLocationMixin> {}

/** PLY dataset configuration */
export interface PLYDatasetConfig extends DatasetConfigBase<'ply'> {
    source: PLYDatasetSourceConfig;
}
