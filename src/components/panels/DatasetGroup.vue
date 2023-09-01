<script setup lang="ts">
import Dataset from '../../types/Dataset';
import DatasetItem from './DatasetItem.vue';

defineProps<{
    group: string,
    datasets: Dataset[],
}>();

defineEmits(['zoom', 'updated'])
</script>

<template>
    <div v-if="datasets.length">
      <h6>{{ group }}</h6>
      <ul class="layers-list-group">
        <DatasetItem
          v-for="layer in datasets"
          :key="layer.name"
          :name="layer.name"
          :visible="layer.visible"
          v-on:zoom="() => $emit('zoom', layer)"
          v-on:delete="() => { layer.delete(); $emit('updated') }"
          v-on:update:visible="() => { layer.visible = !layer.visible; $emit('updated') }"
        />
      </ul>
      <hr>
  </div>
</template>