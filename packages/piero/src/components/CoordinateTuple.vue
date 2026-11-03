<template>
    <div class="d-flex" v-if="displayMode === 'cartesian'">
        <CoordinateFragment :value="coordinates.x.toFixed(0)" prefix="X" />
        <CoordinateFragment :value="coordinates.y.toFixed(0)" prefix="Y" />
    </div>
    <div class="d-flex" v-if="displayMode === 'geographic'">
        <CoordinateFragment :value="geo.latitude.toFixed(4)" prefix="Lat" />
        <CoordinateFragment :value="geo.longitude.toFixed(4)" prefix="Lon" />
    </div>

    <CoordinateFragment
        v-if="z != null"
        :value="formatAltitude(z)"
        prefix="Alt"
        :suffix="unit.getSymbol()"
    />
</template>

<script setup lang="ts">
    import type { Vector2Like, Vector3Like } from 'three';

    import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
    import CoordinateSystem from '@giro3d/giro3d/core/geographic/CoordinateSystem';
    import { LinearUnit } from '@giro3d/giro3d/core/geographic/Unit';
    import { computed } from 'vue';

    import { useGiro3dStore } from '@/stores/giro3d';

    import CoordinateFragment from './CoordinateFragment.vue';

    const { coordinates } = defineProps<{
        coordinates: Vector2Like | Vector3Like;
        displayMode: 'cartesian' | 'geographic';
    }>();

    const scene = useGiro3dStore();

    const z = computed(() => ('z' in coordinates ? coordinates.z : null));
    const geo = computed(() =>
        new Coordinates(scene.getCRS(), coordinates.x, coordinates.y, z.value ?? 0).as(
            CoordinateSystem.epsg4326,
        ),
    );
    const unit = computed(() => scene.getCRS().vertical?.unit ?? LinearUnit.meters);

    const formatAltitude = (z: number): string => {
        const decimals = Math.round((z + 0) * 10);
        return (decimals / 10).toFixed(1);
    };
</script>

<style scoped></style>
