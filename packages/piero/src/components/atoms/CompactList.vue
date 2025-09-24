<script setup lang="ts">
    defineProps<{
        indentation?: string;
    }>();
</script>

<template>
    <ul class="list-group list-group-flush">
        <slot></slot>
    </ul>
</template>

<style scoped>
    :slotted(li.list-group-item) {
        padding-top: 0;
        padding-bottom: 0;
        margin-left: 1rem;
        padding-left: 0;
        padding-right: 0;
    }
</style>
