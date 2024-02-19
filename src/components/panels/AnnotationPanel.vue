<script setup lang="ts">
    import { ref, watch } from 'vue';
    import DropdownView from '@/components/DropdownView.vue';
    import ButtonWithIcon from '@/components/atoms/ButtonWithIcon.vue';
    import AnnotationItem from '@/components/panels/AnnotationItem.vue';
    import EmptyIndicator from '@/components/panels/EmptyIndicator.vue';
    import { useAnnotationStore } from '@/stores/annotations';
    import { useCameraStore } from '@/stores/camera';
    import Download from '@/utils/Download';
    import AnnotationMode, { annotationModes } from '@/types/AnnotationMode';
    import Named from '@/types/Named';
    import Annotation from '@/types/Annotation';

    const annotations = useAnnotationStore();
    const cameraStore = useCameraStore();

    const annotationMode = ref<AnnotationMode>(annotations.getAnnotationMode());
    watch(annotationMode, newMode => {
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
        const geojson = Annotation.toCollection(annotations.getAnnotations());
        Download.downloadAsJson(geojson, 'annotations.json');
    }

    async function importAnnotationFile(e: Event) {
        const files = (e.target as HTMLInputElement).files;

        if (files) annotations.importAnnotationsFiles(files);
    }
</script>

<template>
    <div class="d-flex flex-column h-100">
        <EmptyIndicator text="No annotations" v-if="annotations.count === 0" />

        <ul class="list-group list-group-flush flex-fill overflow-auto">
            <AnnotationItem
                v-for="item in annotations.getAnnotations()"
                :key="item.title"
                :annotation="item"
                :visible="item.visible"
                v-on:update:visible="
                    () => {
                        item.visible = !item.visible;
                        $forceUpdate();
                    }
                "
                v-on:edit="annotations.edit(item)"
                v-on:delete="annotations.remove(item)"
                v-on:download="downloadAnnotation(item)"
                v-on:zoom="goTo(item)"
            />
        </ul>

        <fieldset class="button-area" :disabled="annotations.isUserDrawing()">
            <hr />
            <div class="mb-3">
                <DropdownView
                    label="Mode"
                    description-position="top"
                    :current="annotationModes[0]"
                    :items="annotationModes"
                    @updated:current="src => setCurrentMode(src)"
                />
            </div>
            <button
                title="Add point annotation"
                class="btn btn-primary"
                @click="annotations.createPoint()"
            >
                <i class="bi-pin" /> New points
            </button>
            <button
                title="Add line annotation"
                class="btn btn-primary"
                @click="annotations.createLine()"
            >
                <i class="bi bi-bezier2" /> New line
            </button>
            <button
                title="Add polygon annotation"
                class="btn btn-primary"
                @click="annotations.createPolygon()"
            >
                <i class="bi-heptagon" /> New polygon
            </button>

            <ButtonWithIcon
                title="Export annotations to GeoJSON"
                class="btn-outline-secondary"
                @click="exportAnnotations"
                icon="bi-box-arrow-right"
                text="Export annotations"
            />
            <ButtonWithIcon
                title="Import annotation from GeoJSON"
                class="btn-outline-secondary"
                @click="(hiddenInput as HTMLInputElement).click()"
                icon="bi-box-arrow-left"
                text="Import annotations"
            />
            <input
                ref="hiddenInput"
                class="btn btn-outline-secondary d-none"
                type="file"
                id="annotationFormFile"
                @input="e => importAnnotationFile(e)"
                multiple="true"
            />
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
