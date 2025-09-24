import type z from 'zod';

import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import VectorSource from '@giro3d/giro3d/sources/VectorSource';
import GeoJSON from 'ol/format/GeoJSON';

import type { DatasetBuilder, DatasetBuildResult } from '@/api/DatasetApi';
import type { PieroContext } from '@/context';
import type { LoadDatasetFromFile } from '@/loaders/loader';
import type { Module } from '@/module';

import * as config from '@/types/configuration';
import { CrsName } from '@/types/configuration/crs';
import { OpenLayersFlatStyleLike, toOpenLayersStyle } from '@/types/configuration/style';

const DATASET_TYPE = 'geojson';

export const GeoJSONDataset = config.layer.Layer.extend({
    projection: CrsName.optional().default('EPSG:4326'),
    style: OpenLayersFlatStyleLike.optional(),
    url: config.Url,
});
export type GeoJSONDataset = z.infer<typeof GeoJSONDataset>;

const builder: DatasetBuilder = context => {
    const dataset = GeoJSONDataset.parse(context.dataset);

    const layer = new ColorLayer({
        resolutionFactor: dataset.resolution,
        source: new VectorSource({
            data: {
                format: new GeoJSON(),
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
        type: 'geojson',
        url: typeof context.file === 'string' ? context.file : URL.createObjectURL(context.file),
        visible: true,
    } satisfies GeoJSONDataset;

    return Promise.resolve(result);
};

export default class GeoJSONLoader implements Module {
    public readonly id = 'builtin-loader-geojson';
    public readonly name = 'GeoJSON';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType(DATASET_TYPE, {
            builder,
            fileExtensions: ['geojson', 'geo.json'],
            icon: 'fg-polygon-pt',
            loader,
            name: 'GeoJSON',
        });
    }
}
