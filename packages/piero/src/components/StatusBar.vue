<script setup lang="ts">
    import CoordinateFragment from './CoordinateFragment.vue';

    defineProps({
        x: Number,
        y: Number,
        z: Number,
    });
</script>

<template>
    <div>
        <div class="d-flex column-gap-3">
            <i class="bi text-secondary bi-cursor-fill"></i>
            <CoordinateFragment :value="x?.toFixed(0)" prefix="X:" />
            <CoordinateFragment :value="y?.toFixed(0)" prefix="Y:" />
            <CoordinateFragment :value="z?.toFixed(0)" prefix="Alt.:" suffix="m" />
        </div>
    </div>
</template>

<style scoped>
    i {
        font-size: small;
    }
    div {
        margin-left: 1rem;
    }
</style>
