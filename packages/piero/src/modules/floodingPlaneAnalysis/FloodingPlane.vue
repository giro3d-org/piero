<script setup lang="ts">
    import SwitchToggle from '@/components/SwitchToggle.vue';

    import { useFloodingPlaneStore } from './store';

    const store = useFloodingPlaneStore();

    function setHeight(height: number): void {
        store.setHeight(height);
    }
</script>

<template>
    <div class="input-group mb-3">
        <SwitchToggle
            v-bind:model-value="store.enable"
            v-on:update:model-value="v => store.setEnabled(v)"
            id="flooding-plane-enable"
            title="foo"
        />
        <label for="flooding-plane-enable" class="form-label">Enable flooding plane</label>
    </div>
    <div class="input-group mb-3">
        <label for="flooding-altitude-range" class="form-label">Altitude</label>
        <input
            id="flooding-altitude-range"
            title="Altitude"
            type="range"
            class="form-range"
            min="0"
            step="0.1"
            max="500"
            :value="store.getHeight()"
            @input="event => setHeight(Number.parseFloat((event.target as HTMLInputElement).value))"
        />
        <div class="input-group mb-3">
            <input
                type="number"
                class="form-control"
                id="flooding-altitude-number"
                step="0.1"
                :value="store.getHeight()"
                @input="
                    event => setHeight(Number.parseFloat((event.target as HTMLInputElement).value))
                "
            />
            <span class="input-group-text">m</span>
        </div>
    </div>
</template>
