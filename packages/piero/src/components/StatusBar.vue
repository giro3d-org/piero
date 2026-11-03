<script setup lang="ts">
    import { ref } from 'vue';

    import CoordinateTuple from './CoordinateTuple.vue';

    const props = defineProps<{
        crs?: string;
        x: number;
        y: number;
        z: number;
    }>();

    const isGeographic = ref(true);
</script>

<template>
    <div class="d-flex">
        <a
            class="coordinates"
            href="#"
            @click="() => (isGeographic = !isGeographic)"
            title="Toggle coordinate systems"
        >
            <i :class="isGeographic ? 'fg-globe' : 'fg-grid'" class="text-secondary me-2"></i>
            <span class="text-muted crs">{{ isGeographic ? 'lat/lon' : crs }}</span>
        </a>

        <CoordinateTuple
            :displayMode="isGeographic ? 'geographic' : 'cartesian'"
            :coordinates="props"
        />
    </div>
</template>

<style scoped>
    i {
        font-size: small;
    }

    span {
        font-size: x-small;
    }

    .crs {
        width: 4rem;
        height: 100%;
    }

    .coordinates {
        height: 100%;
        margin: 0;
        margin-left: 0.5em;
        padding: 0;
        font-size: small;
        vertical-align: middle;
        align-self: center;
        align-content: center;
    }
    div {
        margin-left: 1rem;
    }
</style>
