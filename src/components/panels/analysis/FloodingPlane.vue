<script setup lang="ts">
import { useAnalysisStore } from '@/stores/analysis';

const analysis = useAnalysisStore();

function show(visible: boolean) {
    analysis.setFloodingPlaneVisible(visible);
  }

function setHeight(height: number) {
    analysis.setFloodingPlaneHeight(height);
}

</script>

<template>
  <div class="card">
    <h5 class="card-header">
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          :checked="analysis.floodingPlaneVisible"
          type="checkbox"
          role="switch"
          id="enable"
          @input="() => show(!analysis.floodingPlaneVisible)"
        />
        <label class="form-check-label" for="enable">Flooding plane</label>
      </div>
    </h5>
    <div class="card-body" v-if="analysis.floodingPlaneVisible">
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
          @input="(event) => setHeight(Number.parseFloat(event.target.value))"
        />
        <div class="input-group mb-3">
          <input
            type="number"
            class="form-control"
            id="flooding-altitude-number"
            step="0.1"
            :value="analysis.floodingPlaneHeight"
            @input="(event) => setHeight(Number.parseFloat(event.target.value))"
          />
          <span class="input-group-text">m</span>
        </div>
      </div>
    </div>
  </div>
</template>
../../../services/analysis/FloodingPlaneController