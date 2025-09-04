<script setup lang="ts">
    defineProps({
        text: String,
    });
</script>

<template>
    <div class="root">
        <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <div class="text-align-center">
            {{ text }}
        </div>
    </div>
</template>

<style scoped>
    .root {
        opacity: 0.6;
        width: 100%;
        height: 100% !important;
        vertical-align: middle;
        font-size: large !important;
        text-align: center;
    }
</style>
