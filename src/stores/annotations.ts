import Annotation from "@/types/Annotation";
import AnnotationMode from "@/types/AnnotationMode";
import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";

export const useAnnotationStore = defineStore('annotations', () => {
    const annotations = reactive<Annotation[]>([]) as Annotation[];
    const annotationMode = ref<AnnotationMode>('normal');
    const count = computed(() => annotations.length);
    const _isUserDrawing = ref<boolean>(false);

    function isUserDrawing(): boolean {
        return _isUserDrawing.value;
    }

    function setIsUserDrawing(value: boolean) {
        _isUserDrawing.value = value;
    }

    function getAnnotationMode() {
        return annotationMode.value;
    }

    function setAnnotationMode(mode: AnnotationMode) {
        annotationMode.value = mode;
    }

    function getAnnotations(): Annotation[] {
        return annotations;
    }

    function remove(annotation: Annotation) {
        annotations.splice(annotations.indexOf(annotation), 1);
    }

    function createPoint() {
        // Nothing to do.
    }

    function createLine() {
        // Nothing to do.
    }

    function createPolygon() {
        // Nothing to do.
    }

    function add(annotation: Annotation) {
        annotations.push(annotation);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function edit(annotation: Annotation) {
        // Nothing to do.
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function importAnnotation(object: GeoJSON.Feature) {
        // Nothing to do
    }

    return { count, isUserDrawing, setIsUserDrawing, getAnnotationMode, setAnnotationMode, getAnnotations, add, remove, createPoint, createLine, createPolygon, edit, importAnnotation, }
});
