import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import WmsSource from '@giro3d/giro3d/sources/WmsSource';
import z from 'zod';

import type { DatasetBuilder, DatasetBuildResult } from '@/api/DatasetApi';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import * as config from '@/types/configuration';
import { CrsName } from '@/types/configuration/crs';

const DATASET_TYPE = 'wms';

export const WMSDataset = config.layer.Layer.extend({
    format: z.string().nonempty().optional().default('image/jpeg'),
    layer: z.union([z.array(z.string().nonempty()), z.string().nonempty()]),
    projection: CrsName.optional().default('EPSG:3857'),
    url: config.Url,
});
export type WMSDataset = z.infer<typeof WMSDataset>;

const builder: DatasetBuilder = context => {
    const dataset = WMSDataset.parse(context.dataset);

    const layer = new ColorLayer({
        resolutionFactor: dataset.resolution,
        source: new WmsSource({
            imageFormat: dataset.format,
            layer: Array.isArray(dataset.layer) ? dataset.layer : [dataset.layer],
            projection: dataset.projection ?? 'EPSG:3857',
            url: dataset.url,
        }),
    });

    const result: DatasetBuildResult = {
        layers: [layer],
    };

    return Promise.resolve(result);
};

export default class WMSLoader implements Module {
    public readonly id = 'builtin-loader-wms';
    public readonly name = 'WMS';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType(DATASET_TYPE, {
            builder: builder,
            icon: 'fg-layer-alt',
            name: 'WMS',
        });
    }
}
