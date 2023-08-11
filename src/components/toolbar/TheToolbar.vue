<script setup>
import ToolButton from './ToolButton.vue'

defineEmits(['selected'])
</script>


<template>
  <div class="toolbar">
    <ul id="menu" class="nav nav-pills flex-column">
      <li class="nav-item mt-2">
        <img src="/giro3d_logo_compact.svg" height="48" class="mb-3" />
      </li>

      <ToolButton icon="bi-database" title="Datasets" @click="$emit('selected', 'datasets')" />
      <ToolButton icon="bi-layers" title="Basemaps" @click="$emit('selected', 'basemaps')"/>
      <ToolButton icon="bi-front" title="Overlays" @click="$emit('selected', 'overlays')"/>
      <ToolButton icon="bi-rulers" title="Annotations" @click="$emit('selected', 'annotations')"/>
      <ToolButton icon="bi-bar-chart-steps" title="Analysis" @click="$emit('selected', 'analysis')"/>
      <ToolButton icon="bi-bookmarks" title="Bookmarks" @click="$emit('selected', 'bookmarks')"/>
      <ToolButton icon="bi-search" title="Search" @click="$emit('selected', 'search')"/>
      <ToolButton icon="bi-info-circle" title="About" @click="$emit('selected', 'about')"/>

    </ul>
  </div>
</template>

<style scoped>
.toolbar {
  /* padding: 0.4rem; */
}

li {
  /* background-color: var(--color-button);
  width: 3rem;
  height: 3rem; */
  margin: 0.2rem;
  /* border-radius: 0.3rem;
  border-style: none; */
}
</style>
