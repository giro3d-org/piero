import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';

import type Annotation from '@/types/Annotation';
import type AnnotationMode from '@/types/AnnotationMode';

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

    function setIsUserDrawing(value: boolean): void {
        _isUserDrawing.value = value;
    }

    function getAnnotationMode(): AnnotationMode {
        return annotationMode.value;
    }

    function setAnnotationMode(mode: AnnotationMode): void {
        annotationMode.value = mode;
    }

    function getAnnotations(): Annotation[] {
        return annotations;
    }

    function remove(annotation: Annotation): void {
        annotations.splice(annotations.indexOf(annotation), 1);
    }

    function createPoint(): void {
        // Nothing to do.
    }

    function createLine(): void {
        // Nothing to do.
    }

    function createPolygon(): void {
        // Nothing to do.
    }

    function add(annotation: Annotation): void {
        annotations.push(annotation);
    }

    function hasAnnotation(name: string): boolean {
        return annotations.some(m => m.title === name);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function edit(annotation: Annotation): void {
        // Nothing to do.
    }

    function stopEdition(): void {
        // Nothing to do.
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function importAnnotationFile(file: Blob): void {
        // Nothing to do
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function importAnnotationsFiles(files: File[]): void {
        // Nothing to do
    }

    return {
        add,
        count,
        createLine,
        createPoint,
        createPolygon,
        edit,
        getAnnotationMode,
        getAnnotations,
        hasAnnotation,
        importAnnotationFile,
        importAnnotationsFiles,
        isUserDrawing,
        remove,
        setAnnotationMode,
        setIsUserDrawing,
        setShowLabels,
        showLabels,
        stopEdition,
    };
});
