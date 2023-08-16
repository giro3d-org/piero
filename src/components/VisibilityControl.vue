<script setup>
defineProps(['visible'])
defineEmits(['update:visible'])
</script>

<template>
    <a href="#" title="Show/hide this element" @click="$emit('update:visible')">
        <i :class="['bi', 'icon', visible ? 'bi-eye' : 'bi-eye-slash', visible ? null : 'inactive']"></i>
    </a>
</template>

<style scoped>
.icon {
  width: 1rem !important;
  float: right;
}

.inactive {
    color: rgb(180, 180, 180);
}

.active {
  width: 1rem !important;
  float: right;
}

@media (hover: hover) {
  .icon:hover {
    color: rgb(75, 75, 75);
  }
}
</style>