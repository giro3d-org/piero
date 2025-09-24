<script setup lang="ts">
    import CheckboxToggle from './CheckboxToggle.vue';

    defineProps<{
        visible: boolean;
    }>();
    defineEmits(['update:visible']);
</script>

<template>
    <CheckboxToggle :model-value="visible" @update:model-value="v => $emit('update:visible', v)" />
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
