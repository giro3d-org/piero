<script setup lang="ts">
    import { Vector3 } from 'three';
    import { ref } from 'vue';

    import type { Dataset, DatasetOrGroup } from '@/types/Dataset';

    import ButtonArea from '@/components/atoms/ButtonArea.vue';
    import CompactList from '@/components/atoms/CompactList.vue';
    import ImportButton from '@/components/atoms/ImportButton.vue';
    import DatasetOrGroupItem from '@/components/panels/DatasetOrGroupItem.vue';
    import { useBasemapStore } from '@/stores/basemap';
    import { useCameraStore } from '@/stores/camera';
    import { useDatasetStore } from '@/stores/datasets';

    import Slider from '../atoms/Slider.vue';
    import CheckboxToggle from '../CheckboxToggle.vue';
    import DatasetParameters from './DatasetParameters.vue';
    import EmptyIndicator from './EmptyIndicator.vue';

    const datasets = useDatasetStore();
    const camera = useCameraStore();
    const basemap = useBasemapStore();
    const showParameters = ref<Dataset>();

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
</script>

<template>
    <div v-if="showParameters != null" class="d-flex flex-column h-100">
        <DatasetParameters
            @back-to-datasets="showParameters = undefined"
            :dataset="showParameters"
        />
    </div>

    <div v-if="showParameters == null" class="d-flex flex-column h-100 px-2">
        <div v-if="datasets.count > 0" class="flex-fill overflow-auto">
            <!-- The margin counteracts the indentation for the root element -->
            <CompactList style="margin-left: -1rem">
                <DatasetOrGroupItem
                    v-for="dataset of datasets.getTree()"
                    :key="dataset.name"
                    :dataset="dataset"
                    @updated="$forceUpdate()"
                    @zoom="ds => zoomOnDataset(ds)"
                    @show-parameters="ds => showParams(ds)"
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
