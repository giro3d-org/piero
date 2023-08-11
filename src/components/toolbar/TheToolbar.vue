<script setup>
import ToolButton from './ToolButton.vue'

defineProps({
  active: String
})
defineEmits(['selected'])

const buttons = [
  { key: 'datasets', title: 'Datasets', icon: 'bi-database' },
  { key: 'basemaps', title: 'Basemaps', icon: 'bi-layers' },
  { key: 'overlays', title: 'Overlays', icon: 'bi-front' },
  { key: 'annotations', title: 'Annotations', icon: 'bi-rulers' },
  { key: 'analysis', title: 'Analysis', icon: 'bi-bar-chart-steps' },
  { key: 'bookmarks', title: 'Bookmarks', icon: 'bi-bookmarks' },
  { key: 'search', title: 'Search', icon: 'bi-search' },
  { key: 'about', title: 'About', icon: 'bi-info-circle' }
]
</script>

<template>
  <div class="toolbar">
    <ul id="menu" class="nav nav-pills flex-column">
      <li class="nav-item mt-2">
        <a href="https://giro3d.org" target="_blank">
          <img src="/giro3d_logo_compact.svg" height="48" class="mb-3" />
        </a>
      </li>

      <ToolButton
        v-for="button in buttons"
        :active="active === button.key"
        :key="button.key"
        :title="button.title"
        :icon="button.icon"
        @click="$emit('selected', button.key)"
      />
    </ul>
  </div>
</template>

<style scoped>
li {
  margin: 0.2rem;
}
</style>
