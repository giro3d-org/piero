<script setup lang="ts">
    import Icon from './Icon.vue';

    defineProps<{
        icon?: string;
        text?: string;
        title: string;
    }>();

    defineEmits(['click']);
</script>

<template>
    <button :title="title" class="btn" type="button" @click="$emit('click', $event)">
        <Icon v-if="icon" :icon="icon" />
        {{ text }}
    </button>
</template>
