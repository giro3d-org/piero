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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function importMeasure(object: GeoJSON.Feature) {
        // Nothing to do
    }

    function start() { }

    function end() { }

    return { count, getMeasures, isUserMeasuring, setIsUserMeasuring, remove, add, importMeasure, start, end }
});
