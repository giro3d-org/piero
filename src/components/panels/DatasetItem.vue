<script setup lang="ts">
import { type Component, ref } from 'vue';
import { Dataset, DatasetType } from '@/types/Dataset';
import SpinnerControl from '../SpinnerControl.vue';
import VisibilityControl from '../VisibilityControl.vue';
import IfcPropertyView from '@/components/panels/ifc/IfcPropertyView.vue';

const props = defineProps<{
    dataset: Dataset,
}>()

const isLoading = ref(props.dataset.isLoading);
props.dataset.addEventListener('isLoading', () => isLoading.value = props.dataset.isLoading);

defineEmits(['delete', 'zoom', 'clipTo', 'update:visible', 'update:toggle-grid', 'update:toggle-mask'])

const propertyViews: Map<DatasetType, Component> = new Map();
propertyViews.set('ifc', IfcPropertyView);

</script>

<template>
    <li class="list-group-item item">
        <div class="d-flex">
            <VisibilityControl class="float-start" :visible="dataset.visible"
                v-on:update:visible="(v) => $emit('update:visible', v)" />
            <a class="flex-fill dataset" :class="!dataset.visible ? 'disabled' : null" :title="dataset.name" href="#"
                @click="$emit('zoom')">{{ dataset.name }}</a>
            <div class="icons">
                <a v-if="dataset.type === 'ifc' && dataset.isLoaded" href="#" class="icon" title="Show dataset properties"
                    data-bs-toggle="collapse" :data-bs-target="`#collapse-${dataset.uuid}`" aria-expanded="false"
                    aria-controls="`#collapse-${dataset.uuid}`">
                    <i class="bi bi-card-list"></i>
                </a>
                <a v-if="dataset.isLoaded && (dataset.canMaskBasemap || dataset.maskBasemap)" href="#" class="icon"
                    title="Toggle basemap masking" @click="$emit('update:toggle-mask')">
                    <i class="bi bi-mask"></i>
                </a>
                <a v-if="dataset.isLoaded" href="#" class="icon" title="Clip to" @click="$emit('clipTo')">
                    <i class="bi bi-bounding-box"></i>
                </a>
                <a v-if="dataset.isLoaded" href="#" class="icon" title="Toggle 3D grid"
                    @click="$emit('update:toggle-grid')">
                    <i class="bi bi-box"></i>
                </a>
                <div class="icon spinner d-inline-block" v-if="isLoading">
                    <SpinnerControl title="Loading..." />
                </div>
                <a href="#" class="icon" title="Delete this dataset" @click="$emit('delete')">
                    <i class="bi bi-trash"></i>
                </a>
            </div>
        </div>
        <!-- Property view -->
        <div v-if="propertyViews.has(dataset.type)" class="collapse m-2" :id="`collapse-${dataset.uuid}`">
            <component :is="propertyViews.get(dataset.type)" :dataset="dataset"></component>
        </div>
    </li>
</template>

<style scoped>
.item {
    padding: 0.1rem;
}

.spinner {
    /* width: 0.8rem; */
    opacity: 0.5;
}

a {
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

.dataset {
    /* margin-left: 1rem; */
    overflow: hidden;
    text-overflow: ellipsis;
}

.icon {
    /* width: 1rem !important; */
    margin-left: 0.3rem;
    color: rgb(180, 180, 180);
}

@media (hover: hover) {
    .icon:hover {
        color: rgb(75, 75, 75);
    }
}

.spinner-container {
    width: 1rem;
}

.layer-name {
    width: 40%;
    margin-left: 1rem;
}

.slider {
    display: flex;
}
</style>
