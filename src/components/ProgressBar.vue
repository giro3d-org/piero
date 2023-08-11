<script setup>
defineProps({
  /**
   * The progress percentage (in the [0, 100] range)
   */
  percent: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <div
    class="progress"
    role="progressbar"
    aria-label="Progress"
    :aria-valuenow="{ percent }"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div
      class="progress-bar progress-bar-striped progress-bar-animated"
      :style="`width: ${percent}%`"
    ></div>
  </div>
</template>
