import type Annotation from '@/types/Annotation';
import type AnnotationMode from '@/types/AnnotationMode';
import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';

export const useAnnotationStore = defineStore('annotations', () => {
    const annotations = reactive<Annotation[]>([]) as Annotation[];
    const annotationMode = ref<AnnotationMode>('normal');
    const count = computed(() => annotations.length);
    const _isUserDrawing = ref<boolean>(false);
    const _showLabels = ref<boolean>(true);

    function isUserDrawing(): boolean {
        return _isUserDrawing.value;
    }

    function showLabels(): boolean {
        return _showLabels.value;
    }

    function setShowLabels(v: boolean): void {
        _showLabels.value = v;
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

    function hasAnnotation(name: string) {
        return annotations.some(m => m.title === name);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function edit(annotation: Annotation) {
        // Nothing to do.
    }

    function stopEdition() {
        // Nothing to do.
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function importAnnotationFile(file: Blob) {
        // Nothing to do
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function importAnnotationsFiles(files: File[]) {
        // Nothing to do
    }

    return {
        count,
        showLabels,
        setShowLabels,
        isUserDrawing,
        setIsUserDrawing,
        getAnnotationMode,
        setAnnotationMode,
        getAnnotations,
        hasAnnotation,
        add,
        remove,
        createPoint,
        createLine,
        createPolygon,
        edit,
        stopEdition,
        importAnnotationFile,
        importAnnotationsFiles,
    };
});
