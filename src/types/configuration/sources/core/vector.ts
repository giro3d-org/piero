import type { CRS } from '@/types/configuration/geographic';
import type { VectorStyle } from '@/types/VectorStyle';
import type { ImageSourceConfig } from '@/types/configuration/sources/core/baseConfig';
import {
    DatasetSourceConfigDataProjection,
    DatasetSourceConfigElevation,
    DatasetSourceConfigUrlOrData,
} from '../../datasets/core/baseConfig';

/** Configuration for vector sources, common to meshes and map layers */
export interface VectorSourceConfig extends DatasetSourceConfigDataProjection {
    /** @deprecated Use {@link dataProjection} instead, will be removed in 24.10 */
    projection?: CRS;
}

/** Configuration for vector sources displayed as meshes */
export interface VectorSourceAsMeshConfig
    extends VectorSourceConfig,
        DatasetSourceConfigUrlOrData,
        DatasetSourceConfigElevation {}

/** Configuration for vector sources displayed as map layers */
export interface VectorSourceAsLayerConfig extends VectorSourceConfig, ImageSourceConfig {
    /** URL of the source. */
    url: string;
    /** Style */
    style: VectorStyle;
}
