import type {
    DatasetSourceConfigUrl,
    DatasetSourceConfigBase,
    DatasetConfigBaseWithSource,
} from './core/baseConfig';

export interface PotreePointCloudDatasetSourceConfig
    extends DatasetSourceConfigBase<'potree'>,
        DatasetSourceConfigUrl {
    filename?: string;
}

export interface PotreePointCloudDatasetConfig
    extends DatasetConfigBaseWithSource<'potree', PotreePointCloudDatasetSourceConfig> {}
