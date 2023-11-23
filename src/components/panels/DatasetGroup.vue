<script setup lang="ts">
import { useDatasetStore } from '@/stores/datasets';
import { Dataset } from '@/types/Dataset';
import DatasetItem from './DatasetItem.vue';

const store = useDatasetStore();

defineProps<{
    group: string,
    datasets: Dataset[],
}>();

defineEmits(['zoom', 'clipTo', 'updated'])
</script>

<template>
    <div v-if="datasets.length">
      <h6>{{ group }}</h6>
      <ul class="layers-list-group">
        <DatasetItem
          v-for="dataset in datasets"
          :key="dataset.name"
          :dataset="dataset"
          v-on:zoom="() => $emit('zoom', dataset)"
          v-on:clip-to="() => $emit('clipTo', dataset)"
          v-on:delete="store.remove(dataset)"
          @udpdate:toggle-grid="store.toggleGrid(dataset)"
          v-on:update:visible="v => store.setVisible(dataset, v)"
        />
      </ul>
      <hr>
  </div>
</template>
