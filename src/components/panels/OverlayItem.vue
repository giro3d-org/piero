<script setup>
import OpacitySlider from '../OpacitySlider.vue';
import VisibilityControl from '../VisibilityControl.vue';

defineProps({
  visible: Boolean,
  name: String,
  opacity: Number
})
defineEmits(['update:visible', 'update:opacity', 'update:move-up', 'update:move-down'])
</script>

<template>
  <li :class="['list-group-item', 'item', 'd-flex']">
    <VisibilityControl :visible="visible" v-on:update:visible="(v) => $emit('update:visible', v)" />
    <a class="dataset" :class="!visible ? 'disabled' : null" :title="name" href="#" @click="$emit('zoom')">{{ name }}</a>

    <OpacitySlider :class="!visible ? 'disabled' : null" :opacity="opacity" v-on:update:opacity="(v) => $emit('update:opacity', v)" />
    <div class="icons">
      <a href="#" class="icon" title="Move up" @click="$emit('update:move-up')">
        <i class="bi bi-arrow-up"></i>
      </a>
      <a href="#" class="icon" title="Move down" @click="$emit('update:move-down')">
        <i class="bi bi-arrow-down"></i>
      </a>
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
