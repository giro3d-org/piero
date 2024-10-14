import type { PlySource } from '@/giro3d/entities/PlyEntity';
import type { SourceConfigLocationMixin } from '@/types/configuration/sources/core/baseConfig';
import type { DatasetConfigBase } from './core';

/** PLY source configuration */
export interface PLYDatasetSourceConfig
    extends Omit<PlySource, 'at' | 'featureProjection'>,
        Required<SourceConfigLocationMixin> {}

/** PLY dataset configuration */
export interface PLYDatasetConfig extends DatasetConfigBase<'ply'> {
    source: PLYDatasetSourceConfig;
}
