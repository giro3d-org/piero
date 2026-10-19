import CoordinateSystem from '@giro3d/giro3d/core/geographic/CoordinateSystem';

import type { DatasetBuilder } from '@/api/dataset';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import { EsriEntity } from './EsriEntity';

// const DATASET_TYPE = 'gpx';

// export const HuwiseDataset = config.layer.Layer.extend({
//     projection: CrsName.optional().default('EPSG:3857'),
//     style: OpenLayersFlatStyleLike.optional(),
//     url: config.url.Url,
// });
// export type HuwiseDataset = z.infer<typeof HuwiseDataset>;

const builder: DatasetBuilder = context => {
    // const dataset = HuwiseDataset.parse(context.dataset);

    const entity = new EsriEntity({
        dataProjection: 'EPSG:2154', // CoordinateSystem.get(dataset.projection),
        extrusionOffset: 100,
        featureProjection: context.instance.coordinateSystem.id,
        geo_field: 'geo_shape',
        refine_regpar: 'GIG/GIC Standard',
        url: 'https://capgeo2.paris.fr/public/rest/services/DVD/DVD_Stationnement_PMR/MapServer/1',
    });

    return Promise.resolve({
        entities: [entity],
    });
};

/**
 * Loads building meshes from the French BD TOPO provided by IGN.
 */
export default class EsriLoader implements Module {
    public readonly id = 'builtin-loader-huwise';
    public readonly name = 'Esri';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('esri', {
            builder,
            icon: 'bi-buildings',
            name: 'Esri',
        });
    }
}
