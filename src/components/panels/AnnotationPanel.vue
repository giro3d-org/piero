<script setup>
import Annotations from '../controllers/AnnotationController'
import AnnotationItem from './AnnotationItem.vue'
import EmptyIndicator from './EmptyIndicator.vue';

const annotations = Annotations.getAnnotations()

</script>

<template>
  <div>
    <EmptyIndicator text="No annotations" :visible="annotations.length === 0" />

    <ul class="layers-list-group">
      <AnnotationItem
        v-for="item in annotations"
        :key="item.name"
        :name="item.name"
        :visible="item.visible"
        v-on:update:visible="() => { item.visible = !item.visible ; $forceUpdate() }"
        v-on:delete="() => { Annotations.deleteAnnotation(item); $forceUpdate() }"
      />
    </ul>

    <div class="button-area">
        <hr>
        <button title="Add annotation" class="btn btn-primary"><i class="bi-pin" /> New point</button>
        <button title="Add polygon annotation" class="btn btn-primary"><i class="bi bi-bezier2"></i> New line</button>
        <button title="Add polygon annotation" class="btn btn-primary"><i class="bi-heptagon" /> New polygon</button>
    </div>
  </div>
</template>

<style scoped>
.button-area {
    position: absolute;
    bottom: 0;
    padding: 1rem;
}

button {
    margin: 0.2rem;
    width: 100%;
}
</style>
