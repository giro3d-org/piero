<script setup lang="ts">
    import type { Color } from 'three';

    const props = defineProps<{
        color: Color;
    }>();

    const hexString = `#${props.color.getHexString()}`;
</script>

<template>
    <span class="color">
        <span class="d-none">{{ hexString }}</span>
    </span>
    {{ hexString }}
</template>

<style scoped>
    .color {
        height: 15px;
        width: 15px;

        padding: 0px 4px;
        display: inline-block;
        min-width: 13px;
        min-height: 13px;
        border-radius: 3px;
        box-sizing: border-box;
        position: relative;
        vertical-align: middle;
        margin-left: 2px;
        margin-bottom: 2px;
        position: relative;
        top: 1px;

        background-color: v-bind('hexString');
        border: 1px solid black;
        color: black;
        opacity: 1;
    }
</style>
