import KML from 'ol/format/KML';

import { OLLoader } from './core/OLLoader';
import { KMLDatasetConfig } from '@/types/configuration/datasets/KML';

const KMLFormat = new KML();

/** KML loader */
export class KMLLoader extends OLLoader<'kml', KMLDatasetConfig> {
    constructor() {
        super(KMLFormat);
    }
}
