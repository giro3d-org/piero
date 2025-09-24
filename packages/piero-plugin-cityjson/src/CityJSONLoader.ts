import type PickResult from '@giro3d/giro3d/core/picking/PickResult';
import type {
    Attribute,
    AttributeExtractorFn,
    AttributesGroups,
    DatasetBuilder,
    LoadDatasetFromFile,
    Module,
    PieroContext,
} from '@giro3d/piero';
import type z from 'zod';

import EntityPanel from '@giro3d/giro3d/gui/EntityPanel';
import { configuration } from '@giro3d/piero';

import CityJSONEntity, { isCityJSONPickResult } from './CityJSONEntity';
import CityJSONEntityInspector from './CityJSONEntityInspector';

const CityJSONDataset = configuration.Dataset.extend({
    url: configuration.Url,
});
type CityJSONDataset = z.infer<typeof CityJSONDataset>;

export const loader: LoadDatasetFromFile = context => {
    const result = {
        name: context.filename,
        type: 'cityjson',
        url: typeof context.file === 'string' ? context.file : URL.createObjectURL(context.file),
        visible: true,
    } satisfies CityJSONDataset;

    return Promise.resolve(result);
};

export const builder: DatasetBuilder = context => {
    const cfg = CityJSONDataset.parse(context.dataset);

    const entity = new CityJSONEntity({
        featureProjection: context.instance.referenceCrs,
        url: cfg.url,
    });

    return Promise.resolve({
        entities: [entity],
    });
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
    public readonly id = 'plugin-loader-cityjson';
    public readonly name = 'CityJSON';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('cityjson', {
            attributeExtractor: getAttributesFromCityObject,
            builder,
            fileExtensions: ['cityjson', 'city.json'],
            icon: 'bi-buildings',
            loader,
            name: 'CityJSON',
        });

        EntityPanel.registerInspector('CityJSONEntity', CityJSONEntityInspector);
    }
}
