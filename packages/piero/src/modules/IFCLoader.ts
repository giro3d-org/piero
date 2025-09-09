import type { PieroContext } from '@/context';
import type { Builder } from '@/giro3d/EntityBuilder';
import type { LoadDatasetFromFile } from '@/loaders/loader';
import type { Module } from '@/module';
import type { HighlightFn } from '@/services/Highlighter';
import type { AttributeExtractorFn } from '@/services/Picker';
import type { Attribute, AttributesGroups } from '@/types/Feature';
import type { IFCDatasetConfig } from '@/types/configuration/datasets/ifc';
import { getCoordinates } from '@/utils/Configuration';
import Fetcher from '@/utils/Fetcher';
import type PickResult from '@giro3d/giro3d/core/picking/PickResult';
import EntityPanel from '@giro3d/giro3d/gui/EntityPanel';
import { IfcCategoryMap } from 'openbim-components';
import IfcEntity, { isIFCPickResult } from './ifc/IfcEntity';
import IfcEntityInspector from './ifc/IfcEntityInspector';
import IfcPropertyView from './ifc/IfcPropertyView.vue';

const highlight: HighlightFn = (pick: PickResult) => {
    if (isIFCPickResult(pick)) {
        const mesh = pick.object;
        if (mesh.fragment != null && pick.face && pick.instanceId != null) {
            const blockId = mesh.fragment.getVertexBlockID(mesh.geometry, pick.face.a);

            const itemId = mesh.fragment.getItemID(pick.instanceId, blockId).replace(/\..*/, '');

            pick.entity.highlight('selection', mesh, itemId);

            return () => pick.entity.clearHighlight();
        }
    }

    return null;
};

const loader: LoadDatasetFromFile<IFCDatasetConfig> = context => {
    return {
        name: context.filename,
        visible: true,
        type: 'ifc',
        source: {
            url: context.file,
        },
    } satisfies IFCDatasetConfig;
};

const attributeExtractor: AttributeExtractorFn = (
    pickResult: PickResult,
    attributesGroups: AttributesGroups,
) => {
    if (!isIFCPickResult(pickResult)) {
        return;
    }

    const feature = pickResult.features?.at(0);
    if (!feature) {
        return;
    }

    if (!attributesGroups.has('IFC')) {
        attributesGroups.set('IFC', []);
    }
    const attributes = attributesGroups.get('IFC') as Attribute[];

    const { itemProperties, ifcProperties } = feature;

    const nullValue = 'NULL';
    const name = itemProperties.Name?.value ?? nullValue;

    attributes.push({
        key: 'Site',
        value: pickResult.entity.object3d.userData?.dataset?.name ?? nullValue,
    });
    attributes.push({
        key: 'IFCType',
        value: IfcCategoryMap[itemProperties.type] ?? nullValue,
    });
    attributes.push({ key: 'Name', value: name });
    attributes.push({ key: 'ID', value: itemProperties.expressID });
    attributes.push({ key: 'GlobalId', value: itemProperties.GlobalId?.value ?? nullValue });
    if (itemProperties.Description?.value != null) {
        attributes.push({ key: 'Description', value: itemProperties.Description.value });
    }
    if (itemProperties.PredefinedType?.value != null) {
        attributes.push({ key: 'PredefinedType', value: itemProperties.PredefinedType.value });
    }
    if (itemProperties.ObjectType?.value != null) {
        attributes.push({ key: 'ObjectType', value: itemProperties.ObjectType.value });
    }

    for (const { parentName, name, value } of ifcProperties) {
        if (!attributesGroups.has(parentName)) {
            attributesGroups.set(parentName, []);
        }
        attributesGroups.get(parentName)?.push({ key: name, value });
    }
};

const entityBuilder: Builder = context => {
    const dataset = context.dataset;

    const cfg = dataset.config as IFCDatasetConfig;
    const at = getCoordinates(cfg.source.position ?? dataset.get('position'));
    const entity = new IfcEntity({
        ...cfg.source,
        at,
        name: dataset.name,
    });

    return Promise.resolve(entity);
};

/**
 * Loads IFC (Industry Foundation Classes) files.
 */
export default class IFCLoader implements Module {
    readonly name = 'IFC';

    async initialize(context: PieroContext): Promise<void> {
        context.datasets.registerDatasetType('ifc', {
            name: 'IFC',
            icon: 'bi-building',
            loader,
            entityBuilder,
            fileExtensions: ['ifc'],
            propertyView: IfcPropertyView,
            attributeExtractor,
            highlight,
        });

        EntityPanel.registerInspector('IfcEntity', IfcEntityInspector);

        // Preload web-ifc.wasm
        await Fetcher.fetch('web-ifc.wasm').catch(e => {
            console.warn('Could not load web-ifc.wasm', e);
        });
    }
}
