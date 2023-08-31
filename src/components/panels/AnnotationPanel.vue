<script setup lang="ts">
import { shallowRef } from 'vue';
import Annotations from '../controllers/AnnotationController'
import AnnotationItem from './AnnotationItem.vue'
import EmptyIndicator from './EmptyIndicator.vue';
import Annotation from '../../types/Annotation';

const annotations = shallowRef(Annotations.getAnnotations());

function reloadAnnotations() {
  // To allow Vue to detect the change
  annotations.value = [];
  annotations.value = Annotations.getAnnotations();
}

function deleteAnnotation(item: Annotation) {
  Annotations.deleteAnnotation(item);
  reloadAnnotations();
}

function addLineAnnotation() {
  Annotations.createLine().then(reloadAnnotations);
}

function addPolygonAnnotation() {
  Annotations.createPolygon().then(reloadAnnotations);
}

</script>

<template>
  <div>
    <EmptyIndicator text="No annotations" v-if="annotations.length === 0" />

    <ul class="layers-list-group">
      <AnnotationItem
        v-for="item in annotations"
        :key="item.name"
        :name="item.name"
        :visible="item.visible"
        v-on:update:visible="() => { item.visible = !item.visible ; $forceUpdate() }"
        v-on:delete="() => deleteAnnotation(item)"
      />
    </ul>

    <div class="button-area">
        <hr>
        <!-- <button title="Add annotation" class="btn btn-primary"><i class="bi-pin"/> New point</button> -->
        <button title="Add line annotation" class="btn btn-primary" @click="addLineAnnotation"><i class="bi bi-bezier2"/> New line</button>
        <button title="Add polygon annotation" class="btn btn-primary" @click="addPolygonAnnotation"><i class="bi-heptagon"/> New polygon</button>
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
