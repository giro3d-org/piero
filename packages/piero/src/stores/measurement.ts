import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';

import type Measure from '@/types/Measure';
import type MeasurementMode from '@/types/MeasurementMode';

export const useMeasurementStore = defineStore('measurement', () => {
    const measurements = reactive<Measure[]>([]) as Measure[];
    const measurementMode = ref<MeasurementMode>('laser');
    const count = computed(() => measurements.length);
    const _isUserMeasuring = ref<boolean>(false);

    function isUserMeasuring(): boolean {
        return _isUserMeasuring.value;
    }

    function setIsUserMeasuring(value: boolean): void {
        _isUserMeasuring.value = value;
    }

    function getMeasurementMode(): MeasurementMode {
        return measurementMode.value;
    }

    function setMeasurementMode(mode: MeasurementMode): void {
        measurementMode.value = mode;
    }

    function getMeasures(): Measure[] {
        return measurements;
    }

    function remove(measure: Measure): void {
        measurements.splice(measurements.indexOf(measure), 1);
    }

    function add(measure: Measure): void {
        measurements.push(measure);
    }

    function hasMeasure(name: string): boolean {
        return measurements.some(m => m.title === name);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function importMeasureFile(file: Blob): void {
        // Nothing to do
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function importMeasureFiles(files: File[]): void {
        // Nothing to do
    }

    function start(): void {}

    function end(): void {}

    return {
        count,
        getMeasures,
        hasMeasure,
        isUserMeasuring,
        setIsUserMeasuring,
        getMeasurementMode,
        setMeasurementMode,
        remove,
        add,
        importMeasureFile,
        importMeasureFiles,
        start,
        end,
    };
});
