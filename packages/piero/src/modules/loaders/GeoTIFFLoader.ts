import type z from 'zod';

import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer';
import GeoTIFFSource from '@giro3d/giro3d/sources/GeoTIFFSource';

import type { DatasetBuilder } from '@/api';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import { Url } from '@/types/configuration';
import * as config from '@/types/configuration';
import { CrsName } from '@/types/configuration/crs';

const GeoTIFFDataset = config.layer.Layer.extend({
    projection: CrsName,
    url: Url,
});
type GeoTIFFDataset = z.infer<typeof GeoTIFFDataset>;

const builder: DatasetBuilder = context => {
    const dataset = GeoTIFFDataset.parse(context.dataset);

    const source = new GeoTIFFSource({
        crs: dataset.projection,
        url: dataset.url,
    });

    let layer: ColorLayer | ElevationLayer;

    switch (dataset.layerType) {
        case 'color':
            layer = new ColorLayer({ source });
            break;
        case 'elevation':
            layer = new ElevationLayer({ source });
            break;
        default:
            throw new Error(`unsupported layer type: ${dataset.layerType}`);
    }

    return Promise.resolve({
        layers: [layer],
    });
};

export default class GeoTIFFLoader implements Module {
    public readonly id = 'builtin-loader-geotiff';
    public readonly name = 'GeoTIFF';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('geotiff', {
            builder,
            icon: 'fg-layer-alt',
            name: 'GeoTIFF',
        });
    }
}
