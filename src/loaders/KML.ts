import KML from 'ol/format/KML';

import { OLLoader } from './core/OLLoader';

const KMLFormat = new KML();

/** KML loader */
export class KMLLoader extends OLLoader {
    constructor() {
        super(KMLFormat);
    }
}
