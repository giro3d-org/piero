import KML from 'ol/format/KML';

import { OLLoader } from './core/OLLoader';
import type { KMLAsMeshDatasetConfig } from '@/types/configuration/datasets/kml';

const KMLFormat = new KML();

/** KML loader */
export class KMLLoader extends OLLoader<'kml', KMLAsMeshDatasetConfig> {
    constructor() {
        super(KMLFormat);
    }
}
