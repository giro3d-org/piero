import Annotation from "@/types/Annotation";
import { defineStore } from "pinia";
import { computed, reactive } from "vue";

export const useAnnotationStore = defineStore('annotations', () => {
    const annotations = reactive<Annotation[]>([]) as Annotation[];
    const count = computed(() => annotations.length);

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

    return { count, getAnnotations, add, remove, createPoint, createLine, createPolygon, }
});
