<script setup lang="ts">
    import { useAnalysisStore } from '@/stores/analysis';

    const analysis = useAnalysisStore();

    function setHeight(height: number) {
        analysis.setFloodingPlaneHeight(height);
    }
</script>

<template>
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
            :value="analysis.floodingPlaneHeight"
            @input="event => setHeight(Number.parseFloat((event.target as HTMLInputElement).value))"
        />
        <div class="input-group mb-3">
            <input
                type="number"
                class="form-control"
                id="flooding-altitude-number"
                step="0.1"
                :value="analysis.floodingPlaneHeight"
                @input="
                    event => setHeight(Number.parseFloat((event.target as HTMLInputElement).value))
                "
            />
            <span class="input-group-text">m</span>
        </div>
    </div>
</template>
