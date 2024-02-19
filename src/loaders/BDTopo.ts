import { GeoJSON } from 'ol/format';
import { tile } from 'ol/loadingstrategy.js';
import { createXYZ } from 'ol/tilegrid.js';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import { Color, MeshLambertMaterial } from 'three';
import Instance from '@giro3d/giro3d/core/Instance';
import FeatureCollection from '@giro3d/giro3d/entities/FeatureCollection';
import Extent from '@giro3d/giro3d/core/geographic/Extent';

/** Parameters for creating BDTopo object */
export type BDTopoParameters = {
    /** Name of the entity */
    name: string;
};

export default {
    async load(instance: Instance, parameters: BDTopoParameters): Promise<FeatureCollection> {
        const crs = instance.referenceCrs;

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

        const entity = new FeatureCollection(parameters.name, {
            source: vectorSource,
            extent: new Extent('EPSG:2154', -111629.52, 1275028.84, 5976033.79, 7230161.64),
            material: new MeshLambertMaterial(),
            extrusionOffset: (feature: Feature) => {
                const hauteur = -feature.getProperties().hauteur;
                if (Number.isNaN(hauteur)) {
                    return 0;
                }
                return hauteur;
            },
            style: (feature: Feature) => {
                const properties = feature.getProperties();
                const fid = feature.getId();
                let color = '#FFFFFF';
                let visible = true;
                if (properties.usage_1 === 'Résidentiel') {
                    color = '#9d9484';
                } else if (properties.usage_1 === 'Commercial et services') {
                    color = '#b0ffa7';
                }

                if (
                    fid === 'batiment.BATIMENT0000000240851971' ||
                    fid === 'batiment.BATIMENT0000000240851972'
                ) {
                    visible = false;
                }

                return { color: new Color(color), visible };
            },
            minLevel: 11,
            maxLevel: 11,
        });

        return entity;
    },
};
