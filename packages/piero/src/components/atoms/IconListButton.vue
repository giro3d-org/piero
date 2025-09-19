<script setup lang="ts">
    import ButtonWithIcon from './ButtonWithIcon.vue';

    defineProps<{
        icon: string;
        title: string;
    }>();

    defineEmits(['click']);
</script>

<template>
    <ButtonWithIcon
        :title="title"
        :icon="icon"
        @click="$emit('click', $event)"
        class="btn-link link-secondary link-opacity-75 link-opacity-100-hover p-0 border-0"
    />
</template>

<style scoped>
    .btn-link {
        width: 1.2rem;
        height: 1.2rem;
    }
</style>
