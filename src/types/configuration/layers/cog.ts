import type { CogSourceOptions } from '@giro3d/giro3d/sources/CogSource';

import type { SourceConfigBase } from '@/types/configuration/layers/core/baseConfig';
import type { CRS } from '@/types/configuration/geographic';

/** COG source configuration */
export interface COGSourceConfig
    extends Pick<CogSourceOptions, 'url' | 'channels'>,
        SourceConfigBase<'cog'> {
    /** CRS of the source - must be registered first */
    projection: CRS;
}
