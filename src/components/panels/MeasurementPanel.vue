<script setup lang="ts">
import { ref } from 'vue';
import { MathUtils } from 'three';
import EmptyIndicator from './EmptyIndicator.vue';
import MeasurementItem from './MeasurementItem.vue';
import IconButton from '@/components/IconButton.vue';
import { useCameraStore } from '@/stores/camera';
import { useNotificationStore } from '@/stores/notifications';
import { useMeasurementStore } from '@/stores/measurement';
import Measure from '@/types/Measure';
import Notification from '@/types/Notification';
import Download from '@/utils/Download';

const measures = useMeasurementStore();
const cameraStore = useCameraStore();
const notificationStore = useNotificationStore();

const hiddenInput = ref<HTMLInputElement | null>(null);

function goTo(measure: Measure) {
    cameraStore.lookTopDownAt(measure.object);
}

function downloadMeasure(measure: Measure) {
    const geojson = measure.toGeoJSON();
    Download.downloadAsJson(geojson, `measure-${measure.title}.json`);
}

function exportMeasures() {
    const features = measures.getMeasures().map(measure => measure.toGeoJSON());

    Download.downloadAsJson({
        type: 'FeatureCollection',
        features,
        // GeoJSON spec does not allow properties on FeatureCollection
        // But OWC requires it Oo
        id: `${Download.getBaseUrl()}/#${MathUtils.generateUUID()}`,
        properties: {
            lang: "en",
            title: "Giro3D measures",
            updated: new Date().toISOString(),
            creator: "Giro3D",
            generator: {
                title: "Giro3D",
                uri: Download.getBaseUrl(),
            },
            links: [
                {
                    "rel": "profile",
                    "href": "http://www.opengis.net/spec/owc-atom/1.0/req/core",
                    "title": "This file is compliant with version 1.0 of OGC Context"
                }
            ]
        }
    }, 'measures.json');
}

async function importMeasure(file: Blob) {
    const str = await file.text();
    const geojson = JSON.parse(str) as (GeoJSON.Feature | GeoJSON.FeatureCollection);

    const existingMeasures = new Set(measures.getMeasures().map(a => a.title));

    let nbImported = 0;
    let nbSkipped = 0;

    const features = (geojson.type === 'FeatureCollection') ? geojson.features : [geojson];

    for (const feature of features) {
        if (!feature.properties) feature.properties = {};
        if (!feature.properties.title) feature.properties.title = MathUtils.generateUUID();

        if (!existingMeasures.has(feature.properties.title)) {
            measures.importMeasure(feature);
            nbImported++;
        } else {
            nbSkipped++;
        }
    }

    notificationStore.push(new Notification('Measures', `${nbImported} measures imported (${nbSkipped} skipped)`, 'success'));
};

async function importMeasureFile(e: Event) {
    const files = (e.target as HTMLInputElement).files;

    if (files) {
        for (const file of files)
            importMeasure(file);
    }
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
                @input="(e) => importMeasureFile(e)">
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
