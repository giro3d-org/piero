<script setup lang="ts">
import AnnotationItem from './AnnotationItem.vue'
import EmptyIndicator from './EmptyIndicator.vue';
import { useAnnotationStore } from '@/stores/annotations';

const annotations = useAnnotationStore();
</script>

<template>
  <div>
    <EmptyIndicator text="No annotations" v-if="annotations.count === 0" />

    <ul class="layers-list-group">
      <AnnotationItem
        v-for="item in annotations.getAnnotations()"
        :key="item.name"
        :name="item.name"
        :visible="item.visible"
        v-on:update:visible="() => { item.visible = !item.visible ; $forceUpdate() }"
        v-on:delete="annotations.remove(item)"
      />
    </ul>

    <div class="button-area">
        <hr>
        <!-- <button title="Add annotation" class="btn btn-primary"><i class="bi-pin"/> New point</button> -->
        <button title="Add line annotation" class="btn btn-primary" @click="annotations.createLine()"><i class="bi bi-bezier2"/> New line</button>
        <button title="Add polygon annotation" class="btn btn-primary" @click="annotations.createPolygon()"><i class="bi-heptagon"/> New polygon</button>
    </div>
  </div>
</template>

<style scoped>
.button-area {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 1rem;
}

button {
    margin: 0.2rem;
    width: 100%;
}
</style>
