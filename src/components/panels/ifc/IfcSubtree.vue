<!-- <script setup lang="ts">
import { IfcSpatialStructureElement } from '@/types/IFCTypes';
import { ref } from 'vue';
import VisibilityEyeToggle from '@/components/VisibilityEyeToggle.vue';
import { useGiro3dStore } from '@/stores/giro3d';
import { FragmentsGroup } from 'bim-fragment';

const giro3d = useGiro3dStore();

const props = defineProps<{
  ifcElement: IfcSpatialStructureElement,
  ifcModel: FragmentsGroup,
}>()

function traverse(item: IfcSpatialStructureElement, action: (e: IfcSpatialStructureElement) => void) {
    action(item);
    if (item.children && item.children.length > 0) {
        for (const child of item.children) {
            traverse(child, action);
        }
    }
}

const visible = ref(true);

function setVisibility(v: boolean) {
    visible.value = v;

    const ids = [];
    traverse(props.ifcElement, elt => {
        ids.push(elt.expressID);
    });

    if (v) {
        // TODO
        // props.ifcModel.ifcManager.showItems(props.ifcModel.modelID, ids);
    } else {
        // props.ifcModel.ifcManager.hideItems(props.ifcModel.modelID, ids);
    }

    giro3d.notifyChange();
}

const itemProperties = ref(props.ifcMode.getItemProperties(props.ifcModel.modelID, props.ifcElement.expressID));


</script>

<template>
    <div :class="visible ? '' : 'disabled'">
        <div class="d-flex">
            <VisibilityEyeToggle class="mx-1" :visible="visible" @update:visible="v => setVisibility(v)" />
            <span class="badge text-bg-secondary" :title="itemProperties.Name?.value ?? '?'">{{ifcElement.type}}</span>
            <span class="mx-2 text-muted text-truncate name" :title="itemProperties.Name?.value ?? '?'">{{ itemProperties.Name?.value ?? '?' }}</span>
        </div>
        <div v-if="ifcElement.children.length > 0 ">
            <ul>
                <li v-for="(item, index) in ifcElement.children" :key="index" >
                    <IfcSubtree :ifc-element="item" :ifc-model="ifcModel" />
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
ul {
    list-style-type: none;
}

li {
    margin-top: 0.2rem;
}

.name {
    font-size: smaller;
}
</style> -->
