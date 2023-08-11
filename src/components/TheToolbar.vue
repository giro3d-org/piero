<script setup>
import ToolButton from './toolbar/ToolButton.vue'
</script>


<template>
  <div class="main">
    <ul id="menu" class="nav nav-pills flex-column">
      <li class="nav-item mt-2">
        <img src="/giro3d_logo_compact.svg" height="48" class="mb-3" />
      </li>

      <ToolButton icon="bi-database" />
      <ToolButton icon="bi-layers" />
      <ToolButton icon="bi-front" />
      <ToolButton icon="bi-rulers" />
      <ToolButton icon="bi-bar-chart-steps" />
      <ToolButton icon="bi-bookmarks" />
      <ToolButton icon="bi-info-circle" />

    </ul>
  </div>
</template>

<style scoped>
.main {
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
