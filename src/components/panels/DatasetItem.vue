<script setup lang="ts">
import { ref } from 'vue';
import { Dataset } from '@/types/Dataset';
import SpinnerControl from '../SpinnerControl.vue';
import VisibilityControl from '../VisibilityControl.vue';

const props = defineProps<{
  dataset: Dataset,
}>()

const isLoading = ref(props.dataset.isLoading);
props.dataset.addEventListener('isLoading', () => isLoading.value = props.dataset.isLoading);

defineEmits(['delete', 'zoom', 'update:visible'])
</script>

<template>
  <li class="list-group-item item d-flex">
    <VisibilityControl :visible="dataset.visible" v-on:update:visible="(v) => $emit('update:visible', v)" />
    <div class="spinner">
      <SpinnerControl v-show="isLoading" />
    </div>
    <a :class="!dataset.visible ? 'disabled' : null" class="dataset" :title="dataset.name" href="#"
      @click="$emit('zoom')">{{ dataset.name }}</a>
    <div class="icons">
      <a href="#" class="icon" title="Delete this dataset" @click="$emit('delete')">
        <i class="bi bi-trash"></i>
      </a>
    </div>
  </li>
</template>

<style scoped>
.item {
  padding: 0.1rem;
}

.spinner {
  width: 0.4rem;
  opacity: 0.5;
}

a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.icons {
  width: 2rem;
}

.dataset {
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
