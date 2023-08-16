<script setup>
defineProps(['opacity'])
</script>

<template>
    <div class="slider">
      <i title="Transparent" class="bi-x-diamond mx-2"></i>
      <input
        title="Opacity"
        type="range"
        class="form-range"
        min="0"
        step="0.01"
        max="1"
        @input="$emit('update:opacity', $event.target.value)"
        :value="opacity"
      />
      <i title="Opaque" class="bi-x-diamond-fill mx-2"></i>
    </div>
</template>

<style scoped>
.slider {
  display: flex;
}

input {
  display: flex;
  border-color: lightgray;
  border-style: solid;
  border-width: 1px;
  border-radius: 0.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
</style>