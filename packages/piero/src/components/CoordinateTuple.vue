<template>
    <div class="d-flex" v-if="displayMode === 'cartesian'">
        <CoordinateFragment :value="xValue" prefix="X" />
        <CoordinateFragment :value="yValue" prefix="Y" />
    </div>
    <div class="d-flex" v-if="displayMode === 'geographic'">
        <CoordinateFragment :value="latValue" prefix="Lat" />
        <CoordinateFragment :value="lonValue" prefix="Lon" />
    </div>

    <CoordinateFragment :value="zValue" prefix="Alt" :suffix="unit.getSymbol()" />
</template>

<script setup lang="ts">
    import type { Vector3Like } from 'three';

    import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
    import CoordinateSystem from '@giro3d/giro3d/core/geographic/CoordinateSystem';
    import { LinearUnit } from '@giro3d/giro3d/core/geographic/Unit';
    import { computed } from 'vue';

    import { useGiro3dStore } from '@/stores/giro3d';

    import CoordinateFragment from './CoordinateFragment.vue';

    const { coordinates } = defineProps<{
        coordinates: Vector3Like | null;
        displayMode: 'cartesian' | 'geographic';
    }>();

    const scene = useGiro3dStore();

    const formatAltitude = (z: number): string => {
        const decimals = Math.round((z + 0) * 10);
        return (decimals / 10).toFixed(1);
    };

    const geo = computed(() =>
        coordinates
            ? new Coordinates(scene.getCRS(), coordinates.x, coordinates.y, coordinates.z).as(
                  CoordinateSystem.epsg4326,
              )
            : null,
    );

    const xValue = computed(() => (coordinates ? coordinates.x.toFixed(0) : '---'));
    const yValue = computed(() => (coordinates ? coordinates.y.toFixed(0) : '---'));
    const zValue = computed(() => (coordinates ? formatAltitude(coordinates.z) : '---'));

    const latValue = computed(() => (geo.value ? geo.value.latitude.toFixed(4) : '---.----'));
    const lonValue = computed(() => (geo.value ? geo.value.longitude.toFixed(4) : '---.----'));

    const unit = computed(() => scene.getCRS().vertical?.unit ?? LinearUnit.meters);
</script>

<style scoped></style>
