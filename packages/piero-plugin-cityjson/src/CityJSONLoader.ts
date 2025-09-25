import type PickResult from '@giro3d/giro3d/core/picking/PickResult';
import type {
    Attribute,
    AttributeExtractorFn,
    AttributesGroups,
    EntityBuilder,
    LoadDatasetFromFile,
    Module,
    PieroContext,
} from '@giro3d/piero';
// TODO this is a hack because currently the configuration is not modular,
// so we cheat and import types directly from the source. However we would like this configuration
// to be part of this module in the future.
import type { CityJSONDatasetConfig } from '@giro3d/piero/src/types/configuration/datasets/cityjson';

import EntityPanel from '@giro3d/giro3d/gui/EntityPanel';

import CityJSONEntity, { isCityJSONPickResult } from './CityJSONEntity';
import CityJSONEntityInspector from './CityJSONEntityInspector';

export const loader: LoadDatasetFromFile = context => {
    return {
        name: context.filename,
        source: {
            url: context.file,
        },
        type: 'cityjson',
        visible: true,
    } satisfies CityJSONDatasetConfig;
};

export const entityBuilder: EntityBuilder = context => {
    const cfg = context.dataset.config as unknown as CityJSONDatasetConfig;
    // FIXME since we are importing types directly, this causes issues related
    // to path resolution for files (since the main packages uses the @/ alias to resolve modules).
    // when the configuration has been modularized this should not be a problem.
    // @ts-expect-error typing issue
    const entity = new CityJSONEntity({
        ...cfg.source,
        featureProjection: context.instance.referenceCrs,
    });

    return Promise.resolve(entity);
};

const getAttributesFromCityObject: AttributeExtractorFn = (
    pickResult: PickResult,
    attributesGroups: AttributesGroups,
) => {
    if (!isCityJSONPickResult(pickResult)) {
        return;
    }

    const feature = pickResult.features?.at(0);

    if (feature == null) {
        return;
    }

    if (attributesGroups.has('CityJSON') === false) {
        attributesGroups.set('CityJSON', []);
    }
    const cityjsonAttributes = attributesGroups.get('CityJSON') as Attribute[];

    const { cityjsonInfo, citymodel } = feature;

    cityjsonAttributes.push({ key: 'ID', value: cityjsonInfo.objectId });
    cityjsonAttributes.push({ key: 'Type', value: citymodel.type });

    const geometry = citymodel.geometry?.[cityjsonInfo.geometryIndex];
    if (geometry != null) {
        cityjsonAttributes.push({ key: 'LoD', value: geometry.lod });

        const surface = geometry.semantics?.surfaces?.[cityjsonInfo.surfaceTypeIndex];
        if (surface != null) {
            cityjsonAttributes.push({ key: 'Surface type', value: surface.type });
        }
    }
};

export default class CityJSONLoader implements Module {
    public readonly name = 'CityJSON';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('cityjson', {
            attributeExtractor: getAttributesFromCityObject,
            entityBuilder,
            fileExtensions: ['cityjson', 'city.json'],
            icon: 'bi-buildings',
            loader,
            name: 'CityJSON',
        });

        EntityPanel.registerInspector('CityJSONEntity', CityJSONEntityInspector);
    }
}
