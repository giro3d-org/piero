import type { PieroContext } from '@/context';
import type { Builder } from '@/giro3d/EntityBuilder';
import type { LoadDatasetFromFile } from '@/loaders/loader';
import type { Module } from '@/module';
import type { AttributeExtractorFn } from '@/services/Picker';
import type { Attribute, AttributesGroups } from '@/types/Feature';
import type { CityJSONDatasetConfig } from '@/types/configuration/datasets/cityjson';
import type PickResult from '@giro3d/giro3d/core/picking/PickResult';
import EntityPanel from '@giro3d/giro3d/gui/EntityPanel';
import CityJSONEntity, { isCityJSONPickResult } from './cityjson/CityJSONEntity';
import CityJSONEntityInspector from './cityjson/CityJSONEntityInspector';

export const loader: LoadDatasetFromFile = context => {
    return {
        name: context.filename,
        visible: true,
        type: 'cityjson',
        source: {
            url: context.file,
        },
    } satisfies CityJSONDatasetConfig;
};

export const entityBuilder: Builder = context => {
    const cfg = context.dataset.config as unknown as CityJSONDatasetConfig;
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
    if (!feature) {
        return;
    }

    if (!attributesGroups.has('CityJSON')) {
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
    readonly name = 'CityJSON';

    initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('cityjson', {
            name: 'CityJSON',
            icon: 'bi-buildings',
            fileExtensions: ['cityjson', 'city.json'],
            loader,
            entityBuilder,
            attributeExtractor: getAttributesFromCityObject,
        });

        EntityPanel.registerInspector('CityJSONEntity', CityJSONEntityInspector);
    }
}
