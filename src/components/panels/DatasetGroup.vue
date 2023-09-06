<script setup lang="ts">
import { useDatasetStore } from '../../stores/datasets';
import { Dataset } from '../../types/Dataset';
import DatasetItem from './DatasetItem.vue';

const store = useDatasetStore();

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
          v-for="dataset in datasets"
          :key="dataset.name"
          :dataset="dataset"
          v-on:zoom="() => $emit('zoom', dataset)"
          v-on:delete="store.remove(dataset)"
          v-on:update:visible="() => { dataset.visible = !dataset.visible; $emit('updated') }"
        />
      </ul>
      <hr>
  </div>
</template>