import type { DatasetBuilder } from '@/api/dataset';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import { BDTopoEntity } from './bdtopo/BDTopoEntity';

const builder: DatasetBuilder = context => {
    const entity = new BDTopoEntity({
        featureProjection: context.instance.referenceCrs,
    });

    return Promise.resolve({
        entities: [entity],
    });
};

/**
 * Loads building meshes from the French BD TOPO provided by IGN.
 */
export default class BDTopoLoader implements Module {
    public readonly id = 'builtin-loader-bdtopo';
    public readonly name = 'BD TOPO®';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('bdtopo', {
            builder,
            icon: 'bi-buildings',
            name: 'BD TOPO®',
        });
    }
}
