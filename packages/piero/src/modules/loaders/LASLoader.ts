import PointCloud from '@giro3d/giro3d/entities/PointCloud';
import COPCSource from '@giro3d/giro3d/sources/COPCSource';
import LASSource from '@giro3d/giro3d/sources/LASSource';
import z from 'zod';

import type { DatasetBuilder } from '@/api/DatasetApi';
import type { PieroContext } from '@/context';
import type { LoadDatasetFromFile } from '@/loaders/loader';
import type { Module } from '@/module';

import { Dataset, Url } from '@/types/configuration';
import { ColorMap, toGiro3DColorMap } from '@/types/configuration/ColorMap';

const Style = z.object({
    colorMap: ColorMap.default({ max: 100, min: 0, ramp: 'Greys' }),
});

export const LASDataset = Dataset.extend({
    attribute: z.string().optional(),
    style: Style.optional(),
    url: Url,
});
export type LASDataset = z.infer<typeof LASDataset>;

const lasBuilder: DatasetBuilder = context => {
    const dataset = LASDataset.parse(context.dataset);

    const entity = new PointCloud({
        source: new LASSource({
            url: dataset.url,
        }),
    });

    return Promise.resolve({
        entities: [entity],
    });
};

const copcBuilder: DatasetBuilder = context => {
    const dataset = LASDataset.parse(context.dataset);

    const entity = new PointCloud({
        source: new COPCSource({
            url: dataset.url,
        }),
    });

    const activeAttribute = dataset.attribute;
    entity.addEventListener('initialized', () => {
        if (activeAttribute != null) {
            entity.setColoringMode('attribute');
            entity.setActiveAttribute(activeAttribute);
        }
        if (dataset.style?.colorMap != null) {
            entity.colorMap = toGiro3DColorMap(dataset.style.colorMap);
        }
    });

    return Promise.resolve({
        entities: [entity],
    });
};

const loader: LoadDatasetFromFile = context => {
    const result: LASDataset = {
        name: context.filename,
        // TODO we currently cannot stream a COPC file from a file, it causes an error during decoding
        // (something like "Error: Invalid EVLR header length (must be 60)"),
        // so we have to use the less performant non-streamable LAS format for now.
        type: 'las',
        url: typeof context.file === 'string' ? context.file : URL.createObjectURL(context.file),
        visible: true,
    };

    return Promise.resolve(result);
};

/**
 * Loads LAS files, including COPC (Cloud-Optimized point cloud) files.
 */
export default class LASLoader implements Module {
    public readonly id = 'builtin-loader-las';
    public readonly name: string = 'LAS';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('las', {
            builder: lasBuilder,
            fileExtensions: ['laz', 'las'],
            icon: 'fg-multipoint',
            loader,
            name: 'LAS',
        });

        context.datasets.registerDatasetType('copc', {
            builder: copcBuilder,
            fileExtensions: ['copc.laz'],
            icon: 'fg-multipoint',
            loader,
            name: 'Cloud-Optimized Point Cloud (COPC)',
        });
    }
}
