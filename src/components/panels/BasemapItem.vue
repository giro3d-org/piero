<script setup>
defineProps(['opacity', 'visible', 'isLoading', 'name'])
defineEmits(['update:opacity', 'update:visible'])
</script>

<template>
  <li class="list-group-item d-flex justify-content-between">
    <div class="spinner-container">
      <div
        v-if="isLoading"
        class="spinner-border spinner-border-sm text-primary"
        role="status"
      >
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <a href="#" title="Hide this layer" @click="$emit('update:visible')">
      <i :class="['bi', visible ? 'bi-eye' : 'bi-eye-slash']"></i>
    </a>
    <div class="layer-name">{{ name }}</div>
    <div class="slider">
      <i class="bi-x-diamond mx-1"></i>
      <input
        title="Opacity"
        type="range"
        class="form-range"
        min="0"
        step="0.01"
        max="1"
        @input="$emit('update:opacity', $event.target.value)"
        :value="opacity"
      />
      <i class="bi-x-diamond-fill mx-1"></i>
    </div>
  </li>
</template>

<style scoped>
.main {
  display: flex;
  align-items: start;
}

.spinner-container {
  width: 1rem;
}

.layer-name {
  width: 40%;
  margin-left: 1rem;
}

.slider {
  display: flex;
}
</style>
