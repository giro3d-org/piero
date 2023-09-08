<script setup lang="ts">
defineProps<{
    title: string;
    enabled: boolean;
}>()

defineEmits(['update:enabled'])

</script>

<template>
  <div class="card">
    <h5 class="card-header">
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          :checked="enabled"
          type="checkbox"
          role="switch"
          id="enable"
          @input="$emit('update:enabled', !enabled)"
        />
        <label class="form-check-label" for="enable">{{ title }}</label>
      </div>
    </h5>
    <div class="card-body" v-if="enabled">
      <slot></slot>
    </div>
  </div>
</template>