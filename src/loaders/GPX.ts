import GPX from 'ol/format/GPX';

import { OLLoader } from './core/OLLoader';

const GPXFormat = new GPX();

/** GPX loader */
export class GPXLoader extends OLLoader {
    constructor() {
        super(GPXFormat);
    }
}
