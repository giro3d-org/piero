<script setup>
defineProps({
  /**
   * The name of the panel (must match the tooltip
   * of the corresponding tool in the toolbar)
   */
  panelName: {
    type: String,
    required: true
  }
})
</script>

<template>
    <div class="panel">
        <h5 class="title">{{panelName}}</h5>
    </div>
</template>

<style scoped>
.title {
    margin: 1rem;
}

.panel {
    border-color: var(--bs-border-color);
    border-width: 0 2px 0 2px;
    border-style: solid;
}
</style>