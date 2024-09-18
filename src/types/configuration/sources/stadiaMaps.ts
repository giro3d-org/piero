import type { Options as StadiaMapsOptions } from 'ol/source/StadiaMaps';

import type {
    ImageSourceConfig,
    SourceConfigBase,
} from '@/types/configuration/sources/core/baseConfig';

/** StadiaMaps source configuration */
export interface StadiaMapsSourceConfig
    extends SourceConfigBase<'stadiamaps'>,
        ImageSourceConfig,
        Pick<StadiaMapsOptions, 'layer' | 'url' | 'apiKey'> {}
