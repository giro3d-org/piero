import type { BuildingsSource } from '@/giro3d/entities/BuildingsEntity';
import type { DatasetConfigBase } from './core/baseConfig';

/** Buildings dataset configuration */
export interface BuildingsDatasetConfig extends DatasetConfigBase<'buildings'> {
    source: BuildingsSource['source'];
}
