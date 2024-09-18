import type { DatasetConfigBase, DatasetConfigWithSingleUrl } from './core/baseConfig';

export interface PotreePointcCloudDatasetConfig
    extends DatasetConfigBase<'potree'>,
        DatasetConfigWithSingleUrl {
    filename?: string;
}
