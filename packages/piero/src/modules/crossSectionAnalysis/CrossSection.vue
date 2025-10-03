<script setup lang="ts">
    import SwitchToggle from '@/components/SwitchToggle.vue';

    import { useCrossSectionStore } from './store';

    const store = useCrossSectionStore();

    function setOrientation(orientation: number): void {
        store.setOrientation(orientation);
    }

    function setX(x: number): void {
        const center = store.center.clone();
        center.setX(x);
        store.setCenter(center);
    }

    function setY(y: number): void {
        const center = store.center.clone();
        center.setY(y);
        store.setCenter(center);
    }
</script>

<template>
    <div>
        <div class="input-group mb-3">
            <SwitchToggle
                v-bind:model-value="store.enable"
                v-on:update:model-value="v => store.setEnabled(v)"
                id="cross-section-enable"
                title="foo"
            />
            <label for="cross-section-enable" class="form-label">Enable cross section</label>
        </div>

        <div class="input-group mb-3">
            <label for="plane-orientation-range" class="form-label"
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
                    event =>
                        setOrientation(Number.parseFloat((event.target as HTMLInputElement).value))
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
                    event =>
                        setOrientation(Number.parseFloat((event.target as HTMLInputElement).value))
                "
            />
        </div>
        <hr />
        <div class="input-group">
            <label class="form-label">Center (x, y)</label>
            <div class="input-group">
                <input
                    type="number"
                    class="form-control"
                    id="plane-center-x"
                    :value="store.center.x"
                    @input="
                        event => setX(Number.parseFloat((event.target as HTMLInputElement).value))
                    "
                />
                <input
                    type="number"
                    class="form-control"
                    id="plane-center-y"
                    :value="store.center.y"
                    @input="
                        event => setY(Number.parseFloat((event.target as HTMLInputElement).value))
                    "
                />
            </div>
        </div>
    </div>
</template>
