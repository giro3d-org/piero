<script setup>
defineProps(['visible', 'name'])
defineEmits(['delete', 'zoom', 'update:visible'])
</script>

<template>
  <li class="list-group-item item d-flex">
    <a href="#" title="Hide this dataset" @click="$emit('update:visible')">
      <i :class="['bi', 'icon', visible ? 'bi-eye' : 'bi-eye-slash']"></i>
    </a>
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
