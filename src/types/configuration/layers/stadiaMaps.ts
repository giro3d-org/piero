import type { Options as StadiaMapsOptions } from 'ol/source/StadiaMaps';

import type { SourceConfigBase } from '@/types/configuration/layers/core/baseConfig';

/** StadiaMaps source configuration */
export interface StadiaMapsSourceConfig
    extends Pick<StadiaMapsOptions, 'layer' | 'url' | 'apiKey'>,
        SourceConfigBase<'stadiamaps'> {}
