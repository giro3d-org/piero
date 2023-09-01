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
          v-for="dataset in datasets"
          :key="dataset.name"
          :dataset="dataset"
          v-on:zoom="() => $emit('zoom', dataset)"
          v-on:delete="() => { dataset.delete(); $emit('updated') }"
          v-on:update:visible="() => { dataset.visible = !dataset.visible; $emit('updated') }"
        />
      </ul>
      <hr>
  </div>
</template>