import type z from 'zod';

import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import VectorSource from '@giro3d/giro3d/sources/VectorSource';
import GPX from 'ol/format/GPX';
import { Fill, Stroke, Style } from 'ol/style';

import type { DatasetBuilder, DatasetBuildResult } from '@/api/dataset';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import * as config from '@/configuration';
import { CrsName } from '@/configuration/crs';
import { OpenLayersFlatStyleLike, toOpenLayersStyle } from '@/configuration/style';

const DATASET_TYPE = 'gpx';

export const GPXDataset = config.layer.Layer.extend({
    projection: CrsName.optional().default('EPSG:3857'),
    style: OpenLayersFlatStyleLike.optional(),
    url: config.url.Url,
});
export type GPXDataset = z.infer<typeof GPXDataset>;

const DEFAULT_STYLE: Style = new Style({
    fill: new Fill({
        color: 'rgba(72,147,131, 0.4)',
    }),
    stroke: new Stroke({
        color: 'rgba(81, 227, 196, 1)',
        width: 2,
    }),
});

const builder: DatasetBuilder = context => {
    const dataset = GPXDataset.parse(context.dataset);

    const layer = new ColorLayer({
        resolutionFactor: dataset.resolution,
        source: new VectorSource({
            data: {
                format: new GPX(),
                url: dataset.url,
            },
            dataProjection: dataset.projection,
            style: dataset.style != null ? toOpenLayersStyle(dataset.style) : DEFAULT_STYLE,
        }),
    });

    const result: DatasetBuildResult = {
        layers: [layer],
    };

    return Promise.resolve(result);
};

/**
 * Add support for GPX files.
 */
export default class GPXLoader implements Module {
    public readonly id = 'builtin-loader-gpx';
    public readonly name = 'GPX';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType(DATASET_TYPE, {
            builder,
            icon: 'fg-polygon-pt',
            name: 'GPX',
        });
    }
}
