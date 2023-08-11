<script setup>
defineProps({
  icon: {
    type: String,
    required: true
  }
})
</script>

<template>
  <li class="nav-item">
    <a
      id="menu-basemaps-link"
      class="nav-link"
      href="#"
      title="Basemaps"
      data-target="#basemap-list-container"
      ><i :class="['bi', icon]"></i
    ></a>
  </li>
</template>
