<script setup lang="ts">
    defineProps<{
        title?: string;
    }>();
</script>

<template>
    <div
        class="d-inline-block flex-fill text-nowrap text-truncate overflow-hidden px-1"
        :class="$attrs.class"
    >
        {{ title }}
    </div>
</template>
