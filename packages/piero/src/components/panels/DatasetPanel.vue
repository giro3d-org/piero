<script setup lang="ts">
    import { storeToRefs } from 'pinia';
    import { Frustum, Vector3 } from 'three';
    import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

    import type { Dataset, DatasetOrGroup } from '@/types/Dataset';

    import ButtonArea from '@/components/atoms/ButtonArea.vue';
    import CompactList from '@/components/atoms/CompactList.vue';
    import ImportButton from '@/components/atoms/ImportButton.vue';
    import { datasetTitles } from '@/components/Configuration';
    import DatasetOrGroupItem from '@/components/panels/DatasetOrGroupItem.vue';
    import PanelHeader from '@/components/panels/PanelHeader.vue';
    import { ALL_DATASET_TYPES_KEYWORD } from '@/constants';
    import { useBasemapStore } from '@/stores/basemap';
    import { useCameraStore } from '@/stores/camera';
    import { useDatasetPanelStore } from '@/stores/datasetPanel';
    import { useDatasetStore } from '@/stores/datasets';
    import { useGiro3dStore } from '@/stores/giro3d.js';
    import { formatForSearch } from '@/utils/NameFiltering';

    import Slider from '../atoms/Slider.vue';
    import CheckboxToggle from '../CheckboxToggle.vue';
    import DatasetParameters from './DatasetParameters.vue';
    import EmptyIndicator from './EmptyIndicator.vue';

    const giro3dStore = useGiro3dStore();
    const datasetPanel = useDatasetPanelStore();
    const datasets = useDatasetStore();
    const camera = useCameraStore();
    const basemap = useBasemapStore();
    const showParameters = ref<Dataset>();
    const items = useTemplateRef<InstanceType<typeof DatasetOrGroupItem>[]>('items');
    const filterPanel = useTemplateRef<HTMLDivElement>('filterPanel');
    const { doFilterByCamera, filterExpanded, searchQuery, searchText, typeFilter } =
        storeToRefs(datasetPanel);

    let uuidFilter: string[] = [];
    let boundOnFilterByCamera: (() => void) | null = null;

    function getDatasetTitle(type: string): string {
        return datasetTitles[type] ?? type;
    }

    function getDatasetTypes(): string[] {
        const types: Set<string> = new Set<string>();
        datasets.getDatasets().forEach(dataset => {
            types.add(dataset.type);
        });
        return Array.from(types).sort((a, b) =>
            getDatasetTitle(a).localeCompare(getDatasetTitle(b)),
        );
    }

    function importDataset(files: File[]): void {
        for (const file of files) {
            datasets.importFromFile(file);
        }
    }

    function importDatasetFromUrl(): void {
        const url = document.getElementById('dataset-import-url') as HTMLInputElement;
        datasets.importFromFile(url.value);
    }

    function showParams(ds: Dataset): void {
        showParameters.value = ds;
    }

    function zoomOnDataset(dataset: DatasetOrGroup): void {
        const box = datasets.getBoundingBox(dataset);
        if (!box?.isEmpty()) {
            const [width, height] = box.getSize(new Vector3()).toArray();
            const margin = Math.max(width, height) * 0.1;
            const scaledBox = box.clone().expandByScalar(margin);
            camera.lookTopDownAt(scaledBox);
        }
    }

    const filter = (query: string, type: string): void => {
        searchQuery.value = query;
        typeFilter.value = type;
        items.value?.forEach(child => {
            child.filter(query, type, uuidFilter);
        });
    };

    // NOTE: does not take depth queries into account!
    // E.g. dataset is visually occluded by another, but still in the frustum,
    // it will be included in the search
    function onFilterByCamera(): void {
        if (doFilterByCamera.value) {
            const instance = giro3dStore.getMainView();
            const cam = instance?.view?.camera;

            if (cam != null) {
                const frust = new Frustum();
                frust.setFromProjectionMatrix(cam.projectionMatrix);
                frust.planes.forEach(pl => pl.applyMatrix4(cam.matrixWorld));
                uuidFilter = datasets.getDatasetsInCameraFrustum(frust).map(ds => ds.uuid);

                items.value?.forEach(child => {
                    child.filter(searchQuery.value, typeFilter.value, uuidFilter);
                });
            }
        }
    }

    function onFilterCollapsed(): void {
        filterExpanded.value = false;
    }

    function onFilterExpanded(): void {
        filterExpanded.value = true;
    }

    function onSearchInput(value: string): void {
        searchText.value = value;
        filter(formatForSearch(value), typeFilter.value);
    }

    function setDoFilterByCamera(enable: boolean): void {
        const instance = giro3dStore.getMainView();

        if (boundOnFilterByCamera !== null) {
            instance?.removeEventListener('after-camera-update', boundOnFilterByCamera);
            boundOnFilterByCamera = null;
        }
        doFilterByCamera.value = enable;

        if (enable) {
            boundOnFilterByCamera = onFilterByCamera.bind(null);
            instance?.addEventListener('after-camera-update', boundOnFilterByCamera);
            onFilterByCamera();
        } else {
            uuidFilter = [];
            items.value?.forEach(child => {
                child.filter(searchQuery.value, typeFilter.value, []);
            });
        }
    }

    onMounted(() => {
        filterPanel.value?.addEventListener('show.bs.collapse', onFilterExpanded);
        filterPanel.value?.addEventListener('hide.bs.collapse', onFilterCollapsed);

        if (doFilterByCamera.value) {
            setDoFilterByCamera(true);
        } else {
            filter(searchQuery.value, typeFilter.value);
        }
    });

    onBeforeUnmount(() => {
        filterPanel.value?.removeEventListener('show.bs.collapse', onFilterExpanded);
        filterPanel.value?.removeEventListener('hide.bs.collapse', onFilterCollapsed);

        if (boundOnFilterByCamera !== null) {
            const instance = giro3dStore.getMainView();
            instance?.removeEventListener('after-camera-update', boundOnFilterByCamera);
        }
    });
</script>

<template>
    <div v-if="showParameters != null" class="d-flex flex-column h-100">
        <DatasetParameters
            @back-to-datasets="showParameters = undefined"
            :dataset="showParameters"
        />
    </div>

    <div v-if="showParameters == null" class="d-flex flex-column h-100 px-2">
        <PanelHeader title="Data">
            <button
                class="btn btn-sm float-end"
                :class="{ 'btn-success': filterExpanded, 'btn-outline-secondary': !filterExpanded }"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#dataset-filter"
                :aria-expanded="filterExpanded"
                aria-controls="dataset-filter"
            >
                <i class="bi bi-funnel-fill"></i>
            </button>
        </PanelHeader>
        <div
            ref="filterPanel"
            class="collapse card"
            :class="{ show: filterExpanded }"
            id="dataset-filter"
        >
            <div class="d-flex flex-column card-body">
                <div class="input-group">
                    <input
                        :value="searchText"
                        @input="e => onSearchInput((<HTMLInputElement>e.target).value)"
                        type="text"
                        class="form-control w-100"
                        placeholder="Filter by name..."
                    />
                </div>
                <div class="input-group">
                    <select
                        name="type-filter"
                        class="form-control w-100"
                        :value="typeFilter"
                        @change="e => filter(searchQuery, (<HTMLSelectElement>e.target).value)"
                    >
                        <option :value="ALL_DATASET_TYPES_KEYWORD">All Types</option>
                        <option v-for="type of getDatasetTypes()" :key="type" :value="type">
                            {{ getDatasetTitle(type) }}
                        </option>
                    </select>
                </div>
                <CheckboxToggle
                    :model-value="doFilterByCamera"
                    @update:model-value="v => setDoFilterByCamera(v)"
                    title="Filter by Camera View"
                    >Filter datasets in current view</CheckboxToggle
                >
            </div>
        </div>

        <hr />
        <div v-if="datasets.count > 0" class="flex-fill overflow-auto">
            <!-- The margin counteracts the indentation for the root element -->
            <CompactList style="margin-left: -1rem">
                <DatasetOrGroupItem
                    v-for="dataset of datasets.getTree()"
                    ref="items"
                    :key="dataset.name"
                    :dataset="dataset"
                    @updated="$forceUpdate()"
                    @zoom="ds => zoomOnDataset(ds)"
                    @show-parameters="ds => showParams(ds)"
                    @update:expanded="(ds, v) => datasets.setExpanded(ds, v)"
                    @update:visible="(ds, v) => datasets.setVisible(ds, v)"
                />
            </CompactList>
        </div>
        <div v-else class="flex-fill"><EmptyIndicator text="No datasets" /></div>

        <hr />

        <div class="my-1">
            <CheckboxToggle
                :model-value="basemap.visible"
                @update:model-value="v => basemap.setVisible(v)"
                title="Show basemap"
                >Show basemap</CheckboxToggle
            >

            <Slider
                :model-value="basemap.opacity"
                label="Basemap opacity"
                :show-numeric-input="false"
                :min="0"
                :step="0.01"
                :max="1"
                @update:model-value="v => basemap.setOpacity(v)"
            />
        </div>

        <ButtonArea>
            <div class="input-group mb-3">
                <input
                    type="text"
                    id="dataset-import-url"
                    class="form-control"
                    placeholder="https://"
                    aria-label="URL to import"
                    aria-describedby="button-dataset-import-url"
                />
                <button
                    @click="importDatasetFromUrl"
                    class="btn btn-sm btn-outline-secondary"
                    type="button"
                    id="button-dataset-import-url"
                >
                    Import URL
                </button>
            </div>

            <ImportButton title="Import file" text="Import file" @import="importDataset" />
        </ButtonArea>
    </div>
</template>

<style scoped>
    a.icon[aria-expanded='true'] i::before,
    a[aria-expanded='true'] .icon i::before,
    .btn[aria-expanded='true'] > i::before,
    [aria-expanded='true'].shepherd-button > i::before {
        transform: rotate(0);
    }

    .btn[aria-expanded] {
        transition:
            color 0.2s,
            background-color 0.2s,
            border-color 0.2s;
    }
</style>
