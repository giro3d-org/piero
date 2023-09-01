<script setup lang="ts">
defineProps<{
    title: string
    icon: string
    text: string
}>()

defineEmits(['click'])
</script>

<template>
    <button :title="title" class="btn"
        @click="$emit('click', $event)"><i :class="['bi', icon]" /> {{text}}</button>
</template>