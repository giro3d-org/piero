import GPX from 'ol/format/GPX';

import { OLLoader } from './core/OLLoader';
import type { GPXAsMeshDatasetConfig } from '@/types/configuration/datasets/gpx';

const GPXFormat = new GPX();

/** GPX loader */
export class GPXLoader extends OLLoader<'gpx', GPXAsMeshDatasetConfig> {
    constructor() {
        super(GPXFormat);
    }
}
