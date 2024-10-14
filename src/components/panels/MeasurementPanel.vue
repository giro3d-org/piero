<script setup lang="ts">
    import DropdownView from '@/components/DropdownView.vue';
    import ButtonArea from '@/components/atoms/ButtonArea.vue';
    import ButtonWithIcon from '@/components/atoms/ButtonWithIcon.vue';
    import ImportButton from '@/components/atoms/ImportButton.vue';
    import EmptyIndicator from '@/components/panels/EmptyIndicator.vue';
    import MeasurementItem from '@/components/panels/MeasurementItem.vue';
    import { useCameraStore } from '@/stores/camera';
    import { useMeasurementStore } from '@/stores/measurement';
    import Measure from '@/types/Measure';
    import type MeasurementMode from '@/types/MeasurementMode';
    import { measurementModes } from '@/types/MeasurementMode';
    import type Named from '@/types/Named';
    import Download from '@/utils/Download';
    import { ref, watch } from 'vue';

    const measures = useMeasurementStore();
    const cameraStore = useCameraStore();

    const measurementMode = ref<MeasurementMode>(measures.getMeasurementMode());
    watch(measurementMode, newMode => {
        measures.setMeasurementMode(newMode);
    });

    function setCurrentMode(src: Named | null) {
        measurementMode.value = src?.value as MeasurementMode;
    }

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

    function importMeasureFile(files: File[]) {
        measures.importMeasureFiles(files);
    }
</script>

<template>
    <div class="d-flex flex-column h-100">
        <div class="alert alert-warning py-2" role="alert">
            <i class="bi bi-cone-striped"></i> This feature is experimental
        </div>

        <EmptyIndicator text="No measurements" v-if="measures.count === 0" />

        <ul class="list-group list-group-flush flex-fill overflow-auto">
            <MeasurementItem
                v-for="item in measures.getMeasures()"
                :key="item.title"
                :measure="item"
                :visible="item.visible"
                v-on:update:visible="
                    () => {
                        item.visible = !item.visible;
                        $forceUpdate();
                    }
                "
                v-on:delete="measures.remove(item)"
                v-on:download="downloadMeasure(item)"
                v-on:zoom="goTo(item)"
            />
        </ul>

        <ButtonArea id="measures-fieldset">
            <DropdownView
                label="Mode"
                description-position="top"
                :current="measurementModes[0]"
                :items="measurementModes"
                @updated:current="src => setCurrentMode(src)"
                class="mb-2"
            />
            <ButtonWithIcon
                v-if="measures.isUserMeasuring()"
                title="Stop measuring"
                text="Stop measuring"
                icon="bi-stop-circle"
                class="btn-primary"
                @click="measures.end()"
            />
            <ButtonWithIcon
                v-else
                title="Start measuring"
                text="Start measuring"
                icon="bi-rulers"
                class="btn-primary"
                @click="measures.start()"
            />
            <ButtonWithIcon
                title="Export measures to GeoJSON"
                class="btn-outline-secondary"
                @click="exportMeasures"
                icon="bi-box-arrow-right"
                text="Export measures"
            />
            <ImportButton
                title="Import measures from GeoJSON"
                text="Import measures"
                @import="importMeasureFile"
            />
        </ButtonArea>
    </div>
</template>
