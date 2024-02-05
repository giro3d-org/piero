<script setup lang="ts">
    import { ref } from 'vue';

    const hover = ref(false);

    defineProps(['label']);

    const emits = defineEmits<{
        (e: 'drop', ev: DragEvent): void;
    }>();

    function onDragEnter(e: DragEvent) {
        hover.value = true;
        e.preventDefault();
    }

    function onDragLeave(e: DragEvent) {
        hover.value = false;
        e.preventDefault();
    }

    function onDrop(e: DragEvent) {
        hover.value = false;
        emits('drop', e);
        e.preventDefault();
    }

    function onDragOver(e: DragEvent) {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
        }
    }
</script>

<template>
    <div
        class="dropzone"
        :class="hover ? 'show' : 'hide'"
        draggable="true"
        @dragover="onDragOver"
        @dragenter="onDragEnter"
        @dragleave="onDragLeave"
        @drop="onDrop"
    >
        <div v-if="hover" class="content border-secondary">
            <h3 class="text-muted text-center my-2">{{ label }}</h3>
        </div>
    </div>
</template>

<style scoped>
    .dropzone {
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background-color: var(--bs-body-bg);
    }

    .hide {
        z-index: -10;
    }

    .show {
        z-index: 10;
    }

    .content {
        margin: 1rem;
        border-style: dashed;
        border-width: 0.3rem;
        border-radius: 1rem;
        height: calc(100% - 2rem);
        width: calc(100% - 2rem);
        z-index: 2;
        pointer-events: none;
    }
</style>
