<script setup lang="ts">
    import DropdownView from '@/components/DropdownView.vue';
    import SwitchToggle from '@/components/SwitchToggle.vue';
    import ButtonArea from '@/components/atoms/ButtonArea.vue';
    import ButtonWithIcon from '@/components/atoms/ButtonWithIcon.vue';
    import ImportButton from '@/components/atoms/ImportButton.vue';
    import AnnotationItem from '@/components/panels/AnnotationItem.vue';
    import EmptyIndicator from '@/components/panels/EmptyIndicator.vue';
    import { useAnnotationStore } from '@/stores/annotations';
    import { useCameraStore } from '@/stores/camera';
    import Annotation from '@/types/Annotation';
    import type AnnotationMode from '@/types/AnnotationMode';
    import { annotationModes } from '@/types/AnnotationMode';
    import type Named from '@/types/Named';
    import Download from '@/utils/Download';
    import { ref, watch } from 'vue';

    const annotations = useAnnotationStore();
    const cameraStore = useCameraStore();

    const annotationMode = ref<AnnotationMode>(annotations.getAnnotationMode());
    watch(annotationMode, newMode => {
        annotations.setAnnotationMode(newMode);
    });

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

    async function importAnnotationFile(files: File[]) {
        annotations.importAnnotationsFiles(files);
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
                v-on:stop-edit="annotations.stopEdition()"
                v-on:delete="annotations.remove(item)"
                v-on:download="downloadAnnotation(item)"
                v-on:zoom="goTo(item)"
            />
        </ul>

        <ButtonArea :disabled="annotations.isUserDrawing()" id="annotations-fieldset">
            <SwitchToggle
                v-bind:model-value="annotations.showLabels()"
                v-on:update:model-value="v => annotations.setShowLabels(v)"
                title="show labels"
                >Show annotation labels</SwitchToggle
            >
            <DropdownView
                label="Picking mode"
                description-position="top"
                :current="annotationModes[0]"
                :items="annotationModes"
                @updated:current="src => setCurrentMode(src)"
                class="mb-2"
            />
            <ButtonWithIcon
                title="Add point annotation"
                text="New points"
                icon="bi-pin"
                class="btn-primary"
                @click="annotations.createPoint()"
            />
            <ButtonWithIcon
                title="Add line annotation"
                text="New line"
                icon="bi-bezier2"
                class="btn-primary"
                @click="annotations.createLine()"
            />
            <ButtonWithIcon
                title="Add polygon annotation"
                text="New polygon"
                icon="bi-heptagon"
                class="btn-primary"
                @click="annotations.createPolygon()"
            />
            <ButtonWithIcon
                title="Export annotations to GeoJSON"
                text="Export annotations"
                icon="bi-box-arrow-right"
                class="btn-outline-secondary"
                @click="exportAnnotations"
            />
            <ImportButton
                title="Import annotation from GeoJSON"
                text="Import annotations"
                @import="importAnnotationFile"
            />
        </ButtonArea>
    </div>
</template>
