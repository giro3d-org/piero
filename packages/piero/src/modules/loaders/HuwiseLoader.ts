import CoordinateSystem from '@giro3d/giro3d/core/geographic/CoordinateSystem';

import type { DatasetBuilder } from '@/api/dataset';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import { HuwiseEntity } from './HuwiseEntity';

// const DATASET_TYPE = 'gpx';

// export const HuwiseDataset = config.layer.Layer.extend({
//     projection: CrsName.optional().default('EPSG:3857'),
//     style: OpenLayersFlatStyleLike.optional(),
//     url: config.url.Url,
// });
// export type HuwiseDataset = z.infer<typeof HuwiseDataset>;

const builder: DatasetBuilder = context => {
    // const dataset = HuwiseDataset.parse(context.dataset);

    const entity = new HuwiseEntity({
        dataProjection: 'EPSG:4326', // CoordinateSystem.get(dataset.projection),
        featureProjection: context.instance.coordinateSystem.id,
        geo_field: 'geo_shape',
        refine_regpar: 'GIG/GIC Standard',
        url: 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/stationnement-voie-publique-emplacements',
    });

    return Promise.resolve({
        entities: [entity],
    });
};

/**
 * Loads building meshes from the French BD TOPO provided by IGN.
 */
export default class HuwiseLoader implements Module {
    public readonly id = 'builtin-loader-huwise';
    public readonly name = 'Huwise';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('huwise', {
            builder,
            icon: 'bi-buildings',
            name: 'Huwise',
        });
    }
}
