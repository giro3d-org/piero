import type z from 'zod';

import GeoTIFFSource from '@giro3d/giro3d/sources/GeoTIFFSource';

import type { DatasetBuilder } from '@/api/dataset';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import * as config from '@/configuration';
import { CrsName } from '@/configuration/crs';
import { toGiro3DLayer } from '@/utils/Configuration';

const GeoTIFFDataset = config.layer.Layer.extend({
    projection: CrsName,
    url: config.url.Url,
});
type GeoTIFFDataset = z.infer<typeof GeoTIFFDataset>;

const builder: DatasetBuilder = context => {
    const dataset = GeoTIFFDataset.parse(context.dataset);

    const source = new GeoTIFFSource({
        crs: dataset.projection,
        url: dataset.url,
    });

    const layer = toGiro3DLayer(source, dataset, context.instance);

    return Promise.resolve({
        layers: [layer],
    });
};

/**
 * Add support for GeoTIFF files.
 */
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
