<script setup>
import CoordinateFragment from './CoordinateFragment.vue';

defineProps({
    x: Number,
    y: Number,
    z: Number,
})
</script>

<template>
    <div>
        <div class="d-flex">
            <!-- <i class="bi bi-cursor"></i> -->
            <CoordinateFragment :value="x.toFixed(1)" prefix="X:" />
            <CoordinateFragment :value="y.toFixed(1)" prefix="Y:" />
            <CoordinateFragment :value="z.toFixed(0)" prefix="Alt.:" suffix="m" />
        </div>
    </div>
</template>

<style scoped>
div {
    margin-left: 1rem;
}
</style>
