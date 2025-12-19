<script setup lang="ts">
    import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
    import { computed, ref } from 'vue';

    import CoordinateFragment from './CoordinateFragment.vue';

    const props = defineProps<{
        crs?: string;
        x: number;
        y: number;
        z: number;
    }>();

    const latlon = computed(() =>
        new Coordinates(props.crs ?? 'EPSG:3857', props.x ?? 0, props.y ?? 0, props.z ?? 0).as(
            'EPSG:4326',
        ),
    );

    const isGeographic = ref(true);

    const formatAltitude = (z: number): string => {
        const decimals = Math.round((z + 0) * 10);
        return (decimals / 10).toFixed(1);
    };
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

        <CoordinateFragment v-if="!isGeographic" :value="x.toFixed(0)" prefix="X" />
        <CoordinateFragment v-if="!isGeographic" :value="y.toFixed(0)" prefix="Y" />

        <CoordinateFragment
            v-if="isGeographic"
            :value="latlon.latitude.toFixed(4)"
            prefix="Lat"
            suffix="°"
        />
        <CoordinateFragment
            v-if="isGeographic"
            :value="latlon.longitude.toFixed(4)"
            prefix="Lon"
            suffix="°"
        />

        <CoordinateFragment v-if="z != null" :value="formatAltitude(z)" prefix="Alt" suffix="m" />
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
