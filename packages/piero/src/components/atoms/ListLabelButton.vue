<script setup lang="ts">
    defineProps<{
        text: string;
        title?: string;
        disabled?: boolean;
    }>();
    defineEmits(['click']);
</script>

<template>
    <button
        class="btn btn-link d-inline-block flex-fill text-start text-nowrap text-truncate overflow-hidden px-1 py-0 link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
        :class="$attrs.class"
        :title="title ?? text"
        :disabled="!!disabled"
        type="button"
        @click="$emit('click', $event)"
    >
        {{ text }}
    </button>
</template>
