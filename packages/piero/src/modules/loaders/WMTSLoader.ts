import type Giro3DImageFormat from '@giro3d/giro3d/formats/ImageFormat';

import BilFormat from '@giro3d/giro3d/formats/BilFormat';
import WmtsSource from '@giro3d/giro3d/sources/WmtsSource';
import z from 'zod';

import type { DatasetBuilder, DatasetBuildResult } from '@/api/dataset';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import * as config from '@/configuration';
import { CrsName } from '@/configuration/crs';
import { ImageFormat } from '@/configuration/ImageFormat';
import { toGiro3DLayer } from '@/utils/Configuration';

const DATASET_TYPE = 'wmts';

export const WMTSDataset = config.layer.Layer.extend({
    format: ImageFormat.optional().default('image/jpeg'),
    layer: z.string().nonempty().nonoptional(),
    projection: CrsName.optional().default('EPSG:3857'),
    url: config.url.Url,
});

function getDecoder(format: string): Giro3DImageFormat | undefined {
    if (format === 'image/x-bil;bits=32') {
        return new BilFormat();
    }
    return undefined;
}

export type WMTSDataset = z.infer<typeof WMTSDataset>;

const builder: DatasetBuilder = async context => {
    const dataset = WMTSDataset.parse(context.dataset);

    const source = await WmtsSource.fromCapabilities(dataset.url, {
        format: getDecoder(dataset.format),
        imageFormat: dataset.format,
        layer: dataset.layer,
        noDataValue: dataset.nodata,
    });

    const layer = toGiro3DLayer(source, dataset, context.instance);

    const result: DatasetBuildResult = {
        layers: [layer],
    };

    return Promise.resolve(result);
};

/**
 * Add support for WMTS (Web Map Tile Service) layers.
 */
export default class WMTSLoader implements Module {
    public readonly id = 'builtin-loader-wmts';
    public readonly name = 'WMTS';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType(DATASET_TYPE, {
            builder,
            icon: 'fg-layer-alt',
            name: 'WMTS',
        });
    }
}
