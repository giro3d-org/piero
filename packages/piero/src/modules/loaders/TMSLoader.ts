import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource';
import { XYZ } from 'ol/source';
import z from 'zod';

import type { DatasetBuilder, DatasetBuildResult } from '@/api/DatasetApi';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import { Url } from '@/types/configuration';
import { CrsName } from '@/types/configuration/crs';
import { Dataset } from '@/types/configuration/Dataset';

const DATASET_TYPE = 'tms';

export const TMSDataset = Dataset.extend(
    z.object({
        projection: CrsName.optional().default('EPSG:3857'),
        url: Url,
    }).shape,
);
export type TMSDataset = z.infer<typeof TMSDataset>;

const builder: DatasetBuilder = context => {
    const dataset = TMSDataset.parse(context.dataset);
    const layer = new ColorLayer({
        source: new TiledImageSource({
            source: new XYZ({
                projection: dataset.projection ?? 'EPSG:3857',
                url: dataset.url,
            }),
        }),
    });

    const result: DatasetBuildResult = {
        layers: [layer],
    };

    return Promise.resolve(result);
};

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
