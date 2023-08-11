<script setup>
defineProps(['icon', 'title'])
</script>

<template>
  <li class="nav-item">
    <a class="nav-link" href="#" :title="title"><i :class="['bi', icon]"></i></a>
  </li>
</template>
