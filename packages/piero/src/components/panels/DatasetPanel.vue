<script setup lang="ts">
    import { Vector3 } from 'three';

    import type { DatasetOrGroup } from '@/types/Dataset';

    import ButtonArea from '@/components/atoms/ButtonArea.vue';
    import CompactList from '@/components/atoms/CompactList.vue';
    import ImportButton from '@/components/atoms/ImportButton.vue';
    import DatasetOrGroupItem from '@/components/panels/DatasetOrGroupItem.vue';
    import { useCameraStore } from '@/stores/camera';
    import { useDatasetStore } from '@/stores/datasets';

    const datasets = useDatasetStore();
    const camera = useCameraStore();

    function importDataset(files: File[]): void {
        for (const file of files) {
            datasets.importFromFile(file);
        }
    }

    function importDatasetFromUrl(): void {
        const url = document.getElementById('dataset-import-url') as HTMLInputElement;
        datasets.importFromFile(url.value);
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
    <div class="d-flex flex-column h-100">
        <div class="flex-fill overflow-auto">
            <!-- The margin counteracts the indentation for the root element -->
            <CompactList style="margin-left: -1rem">
                <DatasetOrGroupItem
                    v-for="dataset of datasets.getTree()"
                    :key="dataset.name"
                    :dataset="dataset"
                    @updated="$forceUpdate()"
                    @zoom="ds => zoomOnDataset(ds)"
                    @update:toggle-grid="ds => datasets.toggleGrid(ds)"
                    @update:toggle-mask="ds => datasets.toggleMask(ds)"
                    @update:visible="(ds, v) => datasets.setVisible(ds, v)"
                />
            </CompactList>
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
                    class="btn btn-outline-secondary"
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
