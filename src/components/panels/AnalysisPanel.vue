<script setup>
import FloodingPlane from './analysis/FloodingPlane.vue'

const floodingPlane = {
    enabled: false,
    height: 166,
};

</script>

<template>
    <div>
        <ul class="layers-list-group">

            <FloodingPlane class="tool" :value="floodingPlane.height" :enable="floodingPlane.enabled"
                v-on:update:value="(v) => { floodingPlane.height = v; $forceUpdate() }"
                v-on:update:enable="() => { floodingPlane.enabled = !floodingPlane.enabled; $forceUpdate() }" />

        </ul>
    </div>
</template>

<style scoped>
.tool {
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
    margin-top: 1rem;
}
</style>