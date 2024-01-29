<script setup lang="ts">
import { ref, watch } from 'vue';
import { MathUtils } from 'three';
import DropdownView from '@/components/DropdownView.vue';
import IconButton from '@/components/IconButton.vue';
import AnnotationItem from './AnnotationItem.vue'
import EmptyIndicator from './EmptyIndicator.vue';
import { useAnnotationStore } from '@/stores/annotations';
import { useCameraStore } from '@/stores/camera';
import { useNotificationStore } from '@/stores/notifications';
import Download from '@/utils/Download';
import AnnotationMode, { annotationModes } from '@/types/AnnotationMode';
import Named from '@/types/Named';
import Annotation from '@/types/Annotation';
import Notification from '@/types/Notification';

const annotations = useAnnotationStore();
const cameraStore = useCameraStore();
const notificationStore = useNotificationStore();

const annotationMode = ref<AnnotationMode>(annotations.getAnnotationMode());
watch(annotationMode, (newMode, oldMode) => {
    annotations.setAnnotationMode(newMode);
});
const hiddenInput = ref<HTMLInputElement | null>(null);

function setCurrentMode(src: Named | null) {
    annotationMode.value = src?.value as AnnotationMode;
}

function goTo(annotation: Annotation) {
    cameraStore.lookTopDownAt(annotation.object);
}

function downloadAnnotation(annotation: Annotation) {
    const geojson = annotation.toGeoJSON();
    Download.downloadAsJson(geojson, `annotation-${annotation.title}.json`);
}

function exportAnnotations() {
    const features = annotations.getAnnotations().map(annotation => annotation.toGeoJSON());

    Download.downloadAsJson({
        type: 'FeatureCollection',
        features,
        // GeoJSON spec does not allow properties on FeatureCollection
        // But OWC requires it Oo
        id: `${Download.getBaseUrl()}/#${MathUtils.generateUUID()}`,
        properties: {
            lang: "en",
            title: "Giro3D annotations",
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
    }, 'annotations.json');
}

async function importAnnotation(file: Blob) {
    const str = await file.text();
    const geojson = JSON.parse(str) as (GeoJSON.Feature | GeoJSON.FeatureCollection);

    const existingAnnotations = new Set(annotations.getAnnotations().map(a => a.title));

    let nbImported = 0;
    let nbSkipped = 0;

    const features = (geojson.type === 'FeatureCollection') ? geojson.features : [geojson];

    for (const feature of features) {
        if (!feature.properties) feature.properties = {};
        if (!feature.properties.title) feature.properties.title = MathUtils.generateUUID();

        if (!existingAnnotations.has(feature.properties.title)) {
            annotations.importAnnotation(feature);
            nbImported++;
        } else {
            nbSkipped++;
        }
    }

    notificationStore.push(new Notification('Annotations', `${nbImported} annotations imported (${nbSkipped} skipped)`, 'success'));
};

async function importAnnotationFile(e: Event) {
    const files = (e.target as HTMLInputElement).files;

    if (files) {
        for (const file of files)
            importAnnotation(file);
    }
}
</script>

<template>
    <div class="d-flex flex-column h-100">
        <EmptyIndicator text="No annotations" v-if="annotations.count === 0" />

        <ul class="layers-list-group flex-fill overflow-auto">
            <AnnotationItem v-for="item in annotations.getAnnotations()" :key="item.title" :annotation="item"
                :visible="item.visible"
                v-on:update:visible="() => { item.visible = !item.visible; $forceUpdate() }"
                v-on:edit="annotations.edit(item)" v-on:delete="annotations.remove(item)"
                v-on:download="downloadAnnotation(item)"
                v-on:zoom="goTo(item)"
            />
        </ul>

        <fieldset class="button-area" :disabled="annotations.isUserDrawing()">
            <hr>
            <div class="mb-3">
                <DropdownView label="Mode" :current="annotationModes[0]" :items="annotationModes"
                    @updated:current="src => setCurrentMode(src)" />
            </div>
            <button title="Add point annotation" class="btn btn-primary" @click="annotations.createPoint()"><i
                    class="bi-pin" /> New points</button>
            <button title="Add line annotation" class="btn btn-primary" @click="annotations.createLine()"><i
                    class="bi bi-bezier2" /> New line</button>
            <button title="Add polygon annotation" class="btn btn-primary" @click="annotations.createPolygon()"><i
                    class="bi-heptagon" /> New polygon</button>

            <IconButton title="Export annotations to GeoJSON" class="btn-outline-secondary" @click="exportAnnotations"
                icon="bi-box-arrow-right" text="Export annotations" />
            <IconButton title="Import annotation from GeoJSON" class="btn-outline-secondary"
                @click="(hiddenInput as HTMLInputElement).click()" icon="bi-box-arrow-left" text="Import annotations" />
            <input ref="hiddenInput" class="btn btn-outline-secondary d-none" type="file" id="annotationFormFile"
                @input="(e) => importAnnotationFile(e)">
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
