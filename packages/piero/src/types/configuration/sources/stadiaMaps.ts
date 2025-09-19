import type { Options as StadiaMapsOptions } from 'ol/source/StadiaMaps';

import type { ImageSourceConfigMixin, SourceConfigBase } from './core/baseConfig';

/** StadiaMaps source configuration */
export interface StadiaMapsSourceConfig
    extends ImageSourceConfigMixin,
        Pick<StadiaMapsOptions, 'apiKey' | 'layer' | 'url'>,
        SourceConfigBase<'stadiamaps'> {}
