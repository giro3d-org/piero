import type PickResult from '@giro3d/giro3d/core/picking/PickResult';

import type { PieroContext } from '@/context';
import type { EntityBuilder } from '@/giro3d/EntityBuilder';
import type { Module } from '@/module';
import type { AttributeExtractorFn } from '@/services/Picker';
import type { PLYDatasetConfig } from '@/types/configuration/datasets/ply';
import type { Attribute, AttributesGroups } from '@/types/Feature';

import { getCoordinates } from '@/utils/Configuration';

import PlyEntity, { PlyMesh } from './ply/PlyEntity';

const build: EntityBuilder = context => {
    const { dataset, instance } = context;

    const cfg = dataset.config as PLYDatasetConfig;
    const at = getCoordinates(cfg.source.position ?? dataset.get('position'));
    const entity = new PlyEntity({
        ...cfg.source,
        at,
        featureProjection: instance.referenceCrs,
    });

    return Promise.resolve(entity);
};

const getAttributesFromPlyObject: AttributeExtractorFn = (
    pickResult: PickResult,
    attributesGroups: AttributesGroups,
) => {
    if (!PlyMesh.isPlyPickResult(pickResult)) {
        return;
    }

    const feature = pickResult.features?.at(0);
    if (!feature) {
        return;
    }

    if (!attributesGroups.has('PLY')) {
        attributesGroups.set('PLY', []);
    }
    const plyAttributes = attributesGroups.get('PLY') as Attribute[];

    plyAttributes.push({ key: 'Color', value: feature.color });
};

/**
 * Loads .ply files.
 */
export default class PLYLoader implements Module {
    public readonly name = 'PLY';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('ply', {
            icon: 'bi-file-earmark-binary',
            name: 'PLY',
            entityBuilder: build,
            attributeExtractor: getAttributesFromPlyObject,
        });
    }
}
