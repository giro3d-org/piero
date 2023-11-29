<script setup lang="ts">
import VisibilityControl from '../VisibilityControl.vue';

defineProps<{
    visible: boolean,
    name: string,
}>()
defineEmits(['delete', 'download', 'update:visible', 'zoom'])
</script>

<template>
  <li class="list-group-item item d-flex">
    <VisibilityControl :visible="visible" v-on:update:visible="(v) => $emit('update:visible', v)" />

    <a class="title" :title="name" href="#" @click="$emit('zoom')">{{ name }}</a>

    <div class="icons">
      <a href="#" class="icon" title="Download..." @click="$emit('download')">
        <i class="bi bi-download"></i>
      </a>
      <a href="#" class="icon" title="Delete" @click="$emit('delete')">
        <i class="bi bi-trash"></i>
      </a>
    </div>
  </li>
</template>

<style scoped>
.item {
  padding: 0.1rem;
}

a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.icons {
  width: 3rem;
  display: flex;
}

.title {
  white-space: nowrap;
  display: block;
  width: 100% !important;
  margin-left: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon {
  /* width: 1rem !important; */
  padding-left: 0.4rem;
  width: 2rem;
  float: right;
  color: rgb(180, 180, 180);
}

@media (hover: hover) {
  .icon:hover {
    color: rgb(75, 75, 75);
  }
}

.spinner-container {
  width: 1rem;
}

.layer-name {
  width: 40%;
  margin-left: 1rem;
}

.slider {
  display: flex;
}
</style>
