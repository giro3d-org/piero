<script setup lang="ts">
    defineProps({
        text: String,
    });
</script>

<template>
    <div>
        {{ text }}
    </div>
</template>

<style scoped>
    div {
        opacity: 0.4;
        width: 100%;
        height: 100% !important;
        vertical-align: middle;
        font-size: large !important;
        text-align: center;
    }
</style>
