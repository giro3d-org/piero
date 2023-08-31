<script setup lang="ts">
import OpacitySlider from '../OpacitySlider.vue';
import VisibilityControl from '../VisibilityControl.vue';

defineProps({
  opacity: Number,
  visible: Boolean,
  isLoading: Boolean,
  hasOpacitySlider: Boolean,
  name: String,
})

defineEmits(['update:opacity', 'update:visible'])
</script>

<template>
  <li :class="['list-group-item', 'item', 'd-flex']">
    <VisibilityControl :visible="visible" v-on:update:visible="(v) => $emit('update:visible', v)" />
    <div :class="!visible ? 'disabled' : null" class="layer-name">{{ name }}</div>
    <div class="spinner-container">
      <div
        v-if="isLoading"
        class="spinner-border spinner-border-sm text-primary"
        role="status"
      >
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div class="slider">
      <OpacitySlider v-if="hasOpacitySlider" :class="!visible ? 'disabled' : null" :opacity="opacity" v-on:update:opacity="(v) => $emit('update:opacity', v)" />
    </div>
  </li>
</template>

<style scoped>
.item {
  padding: 0.1rem;
}

a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.icons {
  width: 3rem;
}

.dataset {
  white-space: nowrap;
  display: block;
  width: 60% !important;
  margin-left: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon {
  width: 1rem !important;
  float: right;
  color: rgb(180, 180, 180);
}

@media (hover: hover) {
  .icon:hover {
    color: rgb(75, 75, 75);
  }
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
