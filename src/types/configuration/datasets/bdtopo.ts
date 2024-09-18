import type { DatasetConfigBase } from './core/baseConfig';

/** BDTopo dataset configuration */
export interface BDTopoDatasetConfig extends DatasetConfigBase<'bdtopo'> {
    /**
     * @deprecated Not used - will be removed in 24.10
     */
    url?: string;
}
