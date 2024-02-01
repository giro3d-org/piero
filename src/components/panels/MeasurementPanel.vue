<script setup lang="ts">
import { ref } from 'vue';
import EmptyIndicator from './EmptyIndicator.vue';
import MeasurementItem from './MeasurementItem.vue';
import IconButton from '@/components/IconButton.vue';
import { useCameraStore } from '@/stores/camera';
import { useMeasurementStore } from '@/stores/measurement';
import Measure from '@/types/Measure';
import Download from '@/utils/Download';

const measures = useMeasurementStore();
const cameraStore = useCameraStore();

const hiddenInput = ref<HTMLInputElement | null>(null);

function goTo(measure: Measure) {
    cameraStore.lookTopDownAt(measure.object);
}

function downloadMeasure(measure: Measure) {
    const geojson = measure.toGeoJSON();
    Download.downloadAsJson(geojson, `measure-${measure.title}.json`);
}

function exportMeasures() {
    const geojson = Measure.toCollection(measures.getMeasures());
    Download.downloadAsJson(geojson, 'measures.json');
}

async function importMeasureFile(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (files) measures.importMeasureFiles(files);
}
</script>

<template>
    <div class="d-flex flex-column h-100">
        <div class="alert alert-warning py-2" role="alert">
            <i class="bi bi-cone-striped"></i> This feature is experimental
        </div>

        <EmptyIndicator text="No measurements" v-if="measures.count === 0" />

        <ul class="layers-list-group flex-fill overflow-auto">
            <MeasurementItem v-for="item in measures.getMeasures()" :key="item.title" :measure="item"
                :visible="item.visible"
                v-on:update:visible="() => { item.visible = !item.visible; $forceUpdate() }"
                v-on:delete="measures.remove(item)"
                v-on:download="downloadMeasure(item)"
                v-on:zoom="goTo(item)"
            />
        </ul>

        <fieldset class="button-area">
            <hr>
            <button v-if="measures.isUserMeasuring()" title="Stop measuring" class="btn btn-primary" @click="measures.end()"><i
                    class="bi-stop-circle" /> Stop measuring</button>
            <button v-else title="Start measuring" class="btn btn-primary" @click="measures.start()"><i
                    class="bi-rulers" /> Start measuring</button>
            <IconButton title="Export measures to GeoJSON" class="btn-outline-secondary" @click="exportMeasures"
                icon="bi-box-arrow-right" text="Export measures" />
            <IconButton title="Import measures from GeoJSON" class="btn-outline-secondary"
                @click="(hiddenInput as HTMLInputElement).click()" icon="bi-box-arrow-left" text="Import measures" />
            <input ref="hiddenInput" class="btn btn-outline-secondary d-none" type="file" id="measureFormFile"
                @input="(e) => importMeasureFile(e)" multiple="true">
        </fieldset>
    </div>
</template>

<style scoped>
.import {
    height: 30rem;
    width: 100%;
}

button {
    margin: 0.2rem;
    width: 100%;
}
</style>
