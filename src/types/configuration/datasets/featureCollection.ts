import type { FeatureCollectionSource } from '@/giro3d/entities/FeatureCollectionEntity';
import type { DatasetConfigBase } from './core';

/** Buildings dataset configuration */
export interface FeatureCollectionDatasetConfig extends DatasetConfigBase<'featureCollection'> {
    source: FeatureCollectionSource['source'];
}
