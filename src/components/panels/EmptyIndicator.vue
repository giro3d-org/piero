<script setup>
defineProps({
  visible: Boolean,
  text: String,
})
</script>

<template>
    <div v-if="visible">
        {{text}}
    </div>
</template>

<style scoped>
div {
  opacity: 0.4;
  width: 100%;
  height: 100% !important;
  padding-top: 15rem;
  vertical-align: middle;
  font-size: large !important;
  text-align: center;
}
</style>