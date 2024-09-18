import { FillStyle } from '@giro3d/giro3d/core/FeatureTypes';
import Extent from '@giro3d/giro3d/core/geographic/Extent';
import { GeoJSON } from 'ol/format';
import { tile } from 'ol/loadingstrategy.js';
import { createXYZ } from 'ol/tilegrid.js';
import type Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import { Color } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance';
import FeatureCollection from '@giro3d/giro3d/entities/FeatureCollection';

import LoaderCore from './core/LoaderCore';
import type { BDTopoDatasetConfig } from '@/types/configuration/datasets/BDTopo';
import type { DatasetBase } from '@/types/Dataset';

/** Parameters for creating a BDTopo entity */
export interface BDTopoImplParameters {
    name: string;
    featureProjection: string;
}

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
 * BDTopo internal loader
 */
export const BDTopoLoaderImpl = {
    toEntity,
};

/**
 * BDTopo Loader
 */
export class BDTopoLoader extends LoaderCore<'bdtopo', BDTopoDatasetConfig, FeatureCollection> {
    async load(
        instance: Instance,
        dataset: DatasetBase<BDTopoDatasetConfig>,
    ): Promise<FeatureCollection> {
        const entity = await BDTopoLoaderImpl.toEntity({
            name: dataset.name,
            featureProjection: instance.referenceCrs,
        });
        this._fillObject3DUserData(entity, { filename: 'BDTOPO_V3:batiment' });
        return entity;
    }
}
