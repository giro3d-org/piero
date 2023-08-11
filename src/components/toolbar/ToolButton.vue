<script setup>
defineProps(['icon', 'title', 'active'])
</script>

<template>
  <li class="nav-item">
    <a :class="['nav-link', active ? 'active' : null]" href="#" :title="title"><i :class="['bi', icon]"></i></a>
  </li>
</template>
