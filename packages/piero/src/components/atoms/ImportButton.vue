<script setup lang="ts">
    import { ref } from 'vue';
    import ButtonWithIcon from './ButtonWithIcon.vue';

    defineProps<{
        title: string;
        text?: string;
        icon?: string;
    }>();

    const emits = defineEmits<{
        (e: 'import', files: File[]): void;
    }>();

    const hover = ref(false);
    const hiddenInput = ref<HTMLInputElement | null>(null);

    function importFiles(files: FileList | null | undefined) {
        if (files) {
            const a = [];
            for (const file of files) {
                a.push(file);
            }
            emits('import', a);
        }
    }

    function importFromFile(e: Event) {
        const files = (e.target as HTMLInputElement).files;
        importFiles(files);
    }

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
        const files = e.dataTransfer?.files;
        importFiles(files);
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
        draggable="true"
        @dragover="onDragOver"
        @dragenter="onDragEnter"
        @dragleave="onDragLeave"
        @drop="onDrop"
    >
        <ButtonWithIcon
            :title="title"
            :text="text"
            :icon="icon ?? `bi-box-arrow-left`"
            @click="(hiddenInput as HTMLInputElement).click()"
            class="w-100"
            :class="hover ? 'btn-primary' : 'btn-outline-secondary'"
        />
        <input
            ref="hiddenInput"
            class="btn btn-outline-secondary d-none"
            type="file"
            @input="importFromFile"
            multiple="true"
        />
    </div>
</template>
