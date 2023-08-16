<script setup>
defineProps(['value', 'enable'])
defineEmits(['update:value', 'update:enable'])
</script>

<template>
  <div class="card">
    <h5 class="card-header">
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          :checked="enable"
          type="checkbox"
          role="switch"
          id="enable"
          @input="$emit('update:enable')"
        />
        <label class="form-check-label" for="enable">Flooding plane</label>
      </div>
    </h5>
    <div class="card-body" v-if="enable">
      <div class="input-group mb-3">
        <label for="flooding-altitude-range" class="form-label">Altitude</label>
        <input
          id="flooding-altitude-range"
          title="Altitude"
          type="range"
          class="form-range"
          min="0"
          max="500"
          :value="value"
          @input="$emit('update:value', $event.target.value)"
        />
        <div class="input-group mb-3">
          <input
            type="number"
            class="form-control"
            id="flooding-altitude-number"
            :value="value"
            @input="$emit('update:value', $event.target.value)"
          />
          <span class="input-group-text">m</span>
        </div>
      </div>
    </div>
  </div>
</template>
