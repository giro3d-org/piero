<script setup>
defineProps(['opacity'])
</script>

<template>
    <div class="slider">
      <i title="Transparent" class="bi-x-diamond mx-1"></i>
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
      <i title="Opaque" class="bi-x-diamond-fill mx-1"></i>
    </div>
</template>