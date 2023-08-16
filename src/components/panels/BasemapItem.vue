<script setup>
import OpacitySlider from '../OpacitySlider.vue';

defineProps(['opacity', 'visible', 'isLoading', 'name'])
defineEmits(['update:opacity', 'update:visible'])
</script>

<template>
  <li class="list-group-item d-flex justify-content-between">
    <a href="#" title="Hide this layer" @click="$emit('update:visible')">
      <i :class="['bi', 'icon', visible ? 'bi-eye' : 'bi-eye-slash']"></i>
    </a>
    <div class="layer-name">{{ name }}</div>
    <div class="spinner-container">
      <div
        v-if="isLoading"
        class="spinner-border spinner-border-sm text-primary"
        role="status"
      >
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <OpacitySlider :opacity="opacity" />
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

.icon {
  margin-left: 0.2rem;
  width: 1rem !important;
  color: rgb(180, 180, 180);
}

@media (hover: hover) {
  .icon:hover {
    color: rgb(75, 75, 75);
  }
}

.layer-name {
  width: 40%;
  margin-left: 1rem;
}

.slider {
  display: flex;
}
</style>
