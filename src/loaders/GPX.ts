import GPX from 'ol/format/GPX';

import { OLLoader } from './core/OLLoader';
import { GPXDatasetConfig } from '@/types/configuration/datasets/GPX';

const GPXFormat = new GPX();

/** GPX loader */
export class GPXLoader extends OLLoader<GPXDatasetConfig> {
    constructor() {
        super(GPXFormat);
    }
}
