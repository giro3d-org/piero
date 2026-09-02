import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource';
import { XYZ } from 'ol/source';
import z from 'zod';

import type { DatasetBuilder, DatasetBuildResult } from '@/api/dataset';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import * as config from '@/configuration';
import { CrsName } from '@/configuration/crs';
import { toGiro3DLayer } from '@/utils/Configuration';

const DATASET_TYPE = 'tms';

export const TMSDataset = config.layer.Layer.extend(
    z.object({
        projection: CrsName.optional().default('EPSG:3857'),
        url: config.url.Url,
    }).shape,
);
export type TMSDataset = z.infer<typeof TMSDataset>;

const builder: DatasetBuilder = context => {
    const dataset = TMSDataset.parse(context.dataset);

    const source = new TiledImageSource({
        source: new XYZ({
            projection: dataset.projection ?? 'EPSG:3857',
            url: dataset.url,
        }),
    });

    const layer = toGiro3DLayer(source, dataset, context.instance);

    const result: DatasetBuildResult = {
        layers: [layer],
    };

    return Promise.resolve(result);
};

/**
 * Add support for TMS (Tile Map Service) tilesets.
 */
export default class TMSLoader implements Module {
    public readonly id = 'builtin-loader-tms';
    public readonly name = 'TMS';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType(DATASET_TYPE, {
            builder,
            icon: 'fg-layer-alt',
            name: 'TMS',
        });
    }
}
