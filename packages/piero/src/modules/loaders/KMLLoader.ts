import type z from 'zod';

import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import VectorSource from '@giro3d/giro3d/sources/VectorSource';
import KML from 'ol/format/KML';

import type { DatasetBuilder, DatasetBuildResult, LoadDatasetFromFile } from '@/api/DatasetApi';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import * as config from '@/types/configuration';
import { CrsName } from '@/types/configuration/crs';
import { OpenLayersFlatStyleLike, toOpenLayersStyle } from '@/types/configuration/style';

const DATASET_TYPE = 'kml';

export const KMLDataset = config.layer.Layer.extend({
    projection: CrsName.optional().default('EPSG:4326'),
    style: OpenLayersFlatStyleLike.optional(),
    url: config.Url,
});
export type KMLDataset = z.infer<typeof KMLDataset>;

const builder: DatasetBuilder = context => {
    const dataset = KMLDataset.parse(context.dataset);

    const layer = new ColorLayer({
        resolutionFactor: dataset.resolution,
        source: new VectorSource({
            data: {
                format: new KML({
                    extractStyles: dataset.style == null,
                }),
                url: dataset.url,
            },
            dataProjection: dataset.projection,
            style:
                dataset.style != null
                    ? toOpenLayersStyle(dataset.style)
                    : config.style.defaultVectorStyle,
        }),
    });

    const result: DatasetBuildResult = {
        layers: [layer],
    };

    return Promise.resolve(result);
};

const loader: LoadDatasetFromFile = context => {
    const result = {
        layerType: 'color',
        name: context.filename,
        projection: 'EPSG:4326',
        resolution: 1,
        type: 'kml',
        url: typeof context.file === 'string' ? context.file : URL.createObjectURL(context.file),
        visible: true,
    } satisfies KMLDataset;

    return Promise.resolve(result);
};

export default class KMLLoader implements Module {
    public readonly id = 'builtin-loader-kml';
    public readonly name = 'KML';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType(DATASET_TYPE, {
            builder,
            fileExtensions: ['kml'],
            icon: 'fg-polygon-pt',
            loader,
            name: 'KML',
        });
    }
}
