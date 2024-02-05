<script setup lang="ts">
    defineProps<{
        text: string;
        pos: {
            x: number;
            y: number;
        };
    }>();
</script>

<template>
    <div ref="tooltip" :style="`left: calc(${pos.x}px); top: ${pos.y}px`" class="tooltip2">
        {{ text }}
    </div>
</template>

<style scoped>
    .tooltip2 {
        position: absolute !important;
        padding-left: 0.3rem;
        margin-left: 0.5rem;
        margin-top: 0.5rem;
        padding-right: 0.3rem;
        overflow: hidden;
        background-color: black;
        color: aliceblue;
        opacity: 0.5;
        border-width: 1px;
        border-style: solid;
        border-color: gray;
        border-radius: 0.4rem;
    }
</style>
