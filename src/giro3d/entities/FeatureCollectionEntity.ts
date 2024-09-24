import { FillStyle } from '@giro3d/giro3d/core/FeatureTypes';
import Extent from '@giro3d/giro3d/core/geographic/Extent';
import FeatureCollection from '@giro3d/giro3d/entities/FeatureCollection';
import { GeoJSON } from 'ol/format';
import { tile } from 'ol/loadingstrategy.js';
import { createXYZ } from 'ol/tilegrid.js';
import type Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import { Color } from 'three';

import { fillObject3DUserData } from '@/loaders/userData';
import type { FeatureProjectionMixin } from '../sources/mixins';

/** Source options for {@link FeatureCollectionEntity} */
export interface FeatureCollectionSource extends Required<FeatureProjectionMixin> {
    /** Source to use */
    source: 'bdtopo';
}

/**
 * Entity for displaying 3D buildings
 */
export class FeatureCollectionEntity extends FeatureCollection {
    constructor(options: FeatureCollectionSource) {
        const crs = options.featureProjection;
        let filename: string;
        switch (options.source) {
            case 'bdtopo':
                filename = 'BDTOPO_V3:batiment';
                break;
            default: {
                // Exhaustiveness checking
                const _exhaustiveCheck: never = options.source;
                return _exhaustiveCheck;
            }
        }

        const vectorSource = new VectorSource({
            format: new GeoJSON(),
            url: function url(e) {
                return `${
                    'https://wxs.ign.fr/topographie/geoportail/wfs' +
                    // 'https://download.data.grandlyon.com/wfs/rdata'
                    '?SERVICE=WFS' +
                    '&VERSION=2.0.0' +
                    '&request=GetFeature' +
                    '&typename=BDTOPO_V3:batiment' +
                    '&outputFormat=application/json' +
                    `&SRSNAME=${crs}` +
                    '&startIndex=0' +
                    '&bbox='
                }${e.join(',')},${crs}`;
            },
            strategy: tile(createXYZ({ tileSize: 512 })),
        });

        const parentOptions: ConstructorParameters<typeof FeatureCollection>[0] = {
            source: vectorSource,
            extent: new Extent('EPSG:2154', -111629.52, 1275028.84, 5976033.79, 7230161.64),
            extrusionOffset: (feature: Feature) => {
                const hauteur = -feature.getProperties().hauteur;
                if (Number.isNaN(hauteur)) {
                    return 0;
                }
                return hauteur;
            },
            style: (feature: Feature) => {
                const properties = feature.getProperties();
                let color = '#FFFFFF';
                let visible = true;
                if (properties.usage_1 === 'Résidentiel') {
                    color = '#9d9484';
                } else if (properties.usage_1 === 'Commercial et services') {
                    color = '#b0ffa7';
                }

                if (
                    properties.cleabs === 'BATIMENT0000000240851971' ||
                    properties.cleabs === 'BATIMENT0000000240851972'
                ) {
                    // Hide the buildings of our IFC
                    visible = false;
                }

                const fill: FillStyle = {
                    color: new Color(color),
                };

                return {
                    fill: visible ? fill : undefined,
                };
            },
            minLevel: 11,
            maxLevel: 11,
        };

        super(parentOptions);
        this.name = options.source;
        fillObject3DUserData(this, { filename });
    }
}
