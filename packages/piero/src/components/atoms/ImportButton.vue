<script setup lang="ts">
    import { ref } from 'vue';

    import ButtonWithIcon from './ButtonWithIcon.vue';

    defineProps<{
        icon?: string;
        text?: string;
        title: string;
    }>();

    const emits = defineEmits<{
        (e: 'import', files: File[]): void;
    }>();

    const hover = ref(false);
    const hiddenInput = ref<HTMLInputElement | null>(null);

    function importFiles(files: FileList | null | undefined): void {
        if (files) {
            const a = [];
            for (const file of files) {
                a.push(file);
            }
            emits('import', a);
        }
    }

    function importFromFile(e: Event): void {
        const files = (e.target as HTMLInputElement).files;
        importFiles(files);
    }

    function onDragEnter(e: DragEvent): void {
        hover.value = true;
        e.preventDefault();
    }

    function onDragLeave(e: DragEvent): void {
        hover.value = false;
        e.preventDefault();
    }

    function onDragOver(e: DragEvent): void {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
        }
    }

    function onDrop(e: DragEvent): void {
        hover.value = false;
        const files = e.dataTransfer?.files;
        importFiles(files);
        e.preventDefault();
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
