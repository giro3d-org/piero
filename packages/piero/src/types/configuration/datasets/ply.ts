import type { UrlOrDataMixin } from '@/giro3d/sources/mixins';
import type { SourceConfigLocationMixin } from '@/types/configuration/sources/core/baseConfig';

import type { DatasetConfigBase } from './core';

/** PLY source configuration */
export interface PLYDatasetSourceConfig
    extends UrlOrDataMixin,
        Required<SourceConfigLocationMixin> {}

/** PLY dataset configuration */
export interface PLYDatasetConfig extends DatasetConfigBase<'ply'> {
    source: PLYDatasetSourceConfig;
}
