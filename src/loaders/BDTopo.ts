import { FillStyle } from '@giro3d/giro3d/core/FeatureTypes';
import Extent from '@giro3d/giro3d/core/geographic/Extent';
import type Instance from '@giro3d/giro3d/core/Instance';
import FeatureCollection from '@giro3d/giro3d/entities/FeatureCollection';

import Feature from 'ol/Feature';
import { GeoJSON } from 'ol/format';
import { tile } from 'ol/loadingstrategy.js';
import VectorSource from 'ol/source/Vector';
import { createXYZ } from 'ol/tilegrid.js';

import { Color } from 'three';

import LoaderCore from './core/LoaderCore';

/** Parameters for creating BDTopo object */
export type BDTopoParameters = {
    /** Name of the entity */
    name: string;
};

export type BDTopoImplParameters = BDTopoParameters & {
    featureProjection: string;
};

/**
 * Generates the BDTopo entity
 * @param parameters - Loader parameters
 * @returns BDTopo entity
 */
function toEntity(parameters: BDTopoImplParameters): Promise<FeatureCollection> {
    const crs = parameters.featureProjection;

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

    const entity = new FeatureCollection({
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
    });

    entity.name = parameters.name;
    return Promise.resolve(entity);
}

/**
 * BDTopo Loader
 */
export const BDTopoLoaderImpl = {
    toEntity,
};

/**
 * BDTopo Loader
 */
export class BDTopoLoader extends LoaderCore<BDTopoParameters, FeatureCollection> {
    async load(instance: Instance, parameters: BDTopoParameters): Promise<FeatureCollection> {
        const entity = await BDTopoLoaderImpl.toEntity({
            ...parameters,
            featureProjection: instance.referenceCrs,
        });
        this._fillObject3DUserData(entity, { filename: 'BDTOPO_V3:batiment' });
        return entity;
    }
}
