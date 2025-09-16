import type { FeatureCollectionEntityOptions } from '@/giro3d/entities/FeatureCollectionEntity';
import type { DatasetConfigBase } from './core';

/** Buildings dataset configuration */
export interface FeatureCollectionDatasetConfig extends DatasetConfigBase<'featureCollection'> {
    source: FeatureCollectionEntityOptions['source'];
}
