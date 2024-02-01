import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import Measure from "@/types/Measure";

export const useMeasurementStore = defineStore('measurement', () => {
    const measurements = reactive<Measure[]>([]) as Measure[];
    const count = computed(() => measurements.length);
    const _isUserMeasuring = ref<boolean>(false);

    function isUserMeasuring(): boolean {
        return _isUserMeasuring.value;
    }

    function setIsUserMeasuring(value: boolean) {
        _isUserMeasuring.value = value;
    }

    function getMeasures(): Measure[] {
        return measurements;
    }

    function remove(measure: Measure) {
        measurements.splice(measurements.indexOf(measure), 1);
    }

    function add(measure: Measure) {
        measurements.push(measure);
    }

    function hasMeasure(name: string) {
        return measurements.some(m => m.title === name);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function importMeasureFile(file: Blob) {
        // Nothing to do
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function importMeasureFiles(files: FileList) {
        // Nothing to do
    }

    function start() { }

    function end() { }

    return { count, getMeasures, hasMeasure, isUserMeasuring, setIsUserMeasuring, remove, add, importMeasureFile, importMeasureFiles, start, end }
});
