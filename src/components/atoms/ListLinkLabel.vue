<script setup lang="ts">
    defineProps<{
        text: string;
        title?: string;
        href: string;
    }>();
    defineEmits(['click']);
</script>

<template>
    <a
        class="d-inline-block flex-fill text-nowrap text-truncate overflow-hidden px-1 link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
        :class="$attrs.class"
        :title="title ?? text"
        role="button"
        @click="$emit('click', $event)"
    >
        {{ text }}
    </a>
</template>
