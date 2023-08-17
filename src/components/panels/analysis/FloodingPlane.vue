<script setup>
import { ref } from 'vue';
import FloodingPlaneController from '../../controllers/FloodingPlaneController'

const floodingPlane = ref(FloodingPlaneController.getPlane());

function show(visible) {
    floodingPlane.value.visible = visible;
    FloodingPlaneController.updatePlane();
  }

function setHeight(height) {
    floodingPlane.value.height = height;
    FloodingPlaneController.updatePlane();
}

</script>

<template>
  <div class="card">
    <h5 class="card-header">
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          :checked="floodingPlane.visible"
          type="checkbox"
          role="switch"
          id="enable"
          @input="() => show(!floodingPlane.visible)"
        />
        <label class="form-check-label" for="enable">Flooding plane</label>
      </div>
    </h5>
    <div class="card-body" v-if="floodingPlane.visible">
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
          :value="floodingPlane.height"
          @input="(event) => setHeight(Number.parseFloat(event.target.value))"
        />
        <div class="input-group mb-3">
          <input
            type="number"
            class="form-control"
            id="flooding-altitude-number"
            step="0.1"
            :value="floodingPlane.height"
            @input="(event) => setHeight(Number.parseFloat(event.target.value))"
          />
          <span class="input-group-text">m</span>
        </div>
      </div>
    </div>
  </div>
</template>
