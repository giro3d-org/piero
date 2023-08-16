<script setup>
import FloodingPlane from './analysis/FloodingPlane.vue'
</script>

<template>
    <div>
        <ul class="layers-list-group">
            <FloodingPlane class="tool" />
        </ul>
    </div>
</template>

<style scoped>
.tool {
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
    margin-top: 1rem;
}
</style>