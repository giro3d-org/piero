import type { CogSourceOptions } from '@giro3d/giro3d/sources/CogSource';

import type { SourceConfigBase } from './core/baseConfig';
import type { CRS } from '../geographic';

/** COG source configuration */
export interface COGSourceConfig
    extends Pick<CogSourceOptions, 'url' | 'channels'>,
        SourceConfigBase<'cog'> {
    /** CRS of the source - must be registered first */
    projection: CRS;
}
