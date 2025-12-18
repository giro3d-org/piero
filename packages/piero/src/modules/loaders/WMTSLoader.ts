import type { LayerOptions } from '@giro3d/giro3d/core/layer/Layer';
import type Giro3DImageFormat from '@giro3d/giro3d/formats/ImageFormat';

import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer';
import BilFormat from '@giro3d/giro3d/formats/BilFormat';
import WmtsSource from '@giro3d/giro3d/sources/WmtsSource';
import z from 'zod';

import type { DatasetBuilder, DatasetBuildResult } from '@/api/DatasetApi';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import * as config from '@/types/configuration';
import { CrsName } from '@/types/configuration/crs';
import { ImageFormat } from '@/types/configuration/ImageFormat';
import { toGiro3DExtent } from '@/utils/Configuration';

const DATASET_TYPE = 'wmts';

export const WMTSDataset = config.layer.Layer.extend({
    format: ImageFormat.optional().default('image/jpeg'),
    layer: z.string().nonempty().nonoptional(),
    projection: CrsName.optional().default('EPSG:3857'),
    url: config.Url,
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

    const options: LayerOptions = {
        extent: dataset.extent
            ? toGiro3DExtent(dataset.extent, context.instance.referenceCrs).as(
                  context.instance.referenceCrs,
              )
            : undefined,
        noDataOptions:
            dataset.nodata != null
                ? {
                      replaceNoData: true,
                  }
                : undefined,
        resolutionFactor: dataset.resolution,
        source,
    };

    let layer: ColorLayer | ElevationLayer;

    // TODO mask layer ?
    switch (dataset.layerType) {
        case 'color':
            layer = new ColorLayer(options);
            break;
        case 'elevation':
            layer = new ElevationLayer(options);
            break;
        default:
            throw new Error(`unsupported layer type: ${dataset.layerType}`);
    }

    const result: DatasetBuildResult = {
        layers: [layer],
    };

    return Promise.resolve(result);
};

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
