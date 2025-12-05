<script setup lang="ts">
    import type Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';

    import CoordinateInput from '@/components/CoordinateInput.vue';
    import SwitchToggle from '@/components/SwitchToggle.vue';

    import { useCrossSectionStore } from './store';

    const store = useCrossSectionStore();

    function setOrientation(orientation: number): void {
        store.setOrientation(orientation);
    }

    const onCenterUpdated = (v: Coordinates): void => {
        store.setCenter(v.toVector3());
    };
</script>

<template>
    <div class="input-group">
        <SwitchToggle
            v-bind:model-value="store.enable"
            v-on:update:model-value="v => store.setEnabled(v)"
            id="cross-section-enable"
            title="Enable cross-section"
        />
        <label for="cross-section-enable" class="form-check-label">Enable cross section</label>
    </div>

    <div class="input-group my-3">
        <label for="plane-orientation-range" class="form-check-label"
            >Plane orientation (0-360°)</label
        >
        <input
            id="plane-orientation-range"
            title="Altitude"
            type="range"
            class="form-range"
            min="0"
            step="0.1"
            max="360"
            :value="store.orientation"
            @input="
                event => setOrientation(Number.parseFloat((event.target as HTMLInputElement).value))
            "
        />
    </div>
    <div class="input-group mb-3">
        <input
            type="number"
            class="form-control"
            id="plane-orientation-number"
            step="0.1"
            :value="store.orientation"
            @input="
                event => setOrientation(Number.parseFloat((event.target as HTMLInputElement).value))
            "
        />
    </div>
    <hr />
    <CoordinateInput
        label="Center"
        :initial-value="store.center"
        v-if="store.instance != null"
        :instance="store.instance"
        :cursor-manager="store.cursorManager"
        @update:coordinates="onCenterUpdated"
    />
</template>
