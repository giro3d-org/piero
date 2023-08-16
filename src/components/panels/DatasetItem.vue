<script setup>
import VisibilityControl from '../VisibilityControl.vue';

defineProps({
  visible: Boolean,
  name: String
})
defineEmits(['delete', 'zoom', 'update:visible'])
</script>

<template>
  <li class="list-group-item item d-flex">
    <VisibilityControl :visible="visible" v-on:update:visible="(v) => $emit('update:visible', v)" />
    <a class="dataset" :title="name" href="#" @click="$emit('zoom')">{{ name }}</a>
    <div class="icons">
      <a href="#" class="icon" title="Delete this dataset" @click="$emit('delete')">
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
  width: 2rem;
}

.dataset {
  margin-left: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon {
  width: 1rem !important;
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
