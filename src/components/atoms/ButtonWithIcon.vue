<script setup lang="ts">
    defineProps<{
        title: string;
        icon?: string;
        text?: string;
    }>();

    defineEmits(['click']);
</script>

<template>
    <button :title="title" class="btn" type="button" @click="$emit('click', $event)">
        <i v-if="icon" :class="['bi', icon]" />
        {{ text }}
    </button>
</template>
