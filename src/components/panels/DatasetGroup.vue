<script setup lang="ts">
import Dataset from '../../types/Dataset';
import DatasetItem from './DatasetItem.vue';

defineProps<{
    group: string,
    datasets: Dataset[],
}>();

defineEmits(['zoom'])
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
          v-on:delete="() => { layer.delete(); $forceUpdate() }"
          v-on:update:visible="(v) => { layer.visible = !layer.visible; $forceUpdate() }"
        />
      </ul>
      <hr>
  </div>
</template>