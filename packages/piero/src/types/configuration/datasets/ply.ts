import type { UrlOrDataMixin } from '@/giro3d/sources/mixins';
import type { SourceConfigLocationMixin } from '@/types/configuration/sources/core/baseConfig';

import type { DatasetConfigBase } from './core';

/** PLY dataset configuration */
export interface PLYDatasetConfig extends DatasetConfigBase<'ply'> {
    source: PLYDatasetSourceConfig;
}

/** PLY source configuration */
export interface PLYDatasetSourceConfig
    extends Required<SourceConfigLocationMixin>,
        UrlOrDataMixin {}
