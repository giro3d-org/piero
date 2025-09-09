<script setup lang="ts">
    defineProps<{
        visible: boolean;
    }>();
    defineEmits(['update:visible']);
</script>

<template>
    <a class="icon" href="#" @click="$emit('update:visible', !visible)">
        <i class="bi" :class="visible ? 'bi-eye' : 'bi-eye-slash'"></i>
    </a>
</template>

<style scoped>
    .icon {
        width: 1rem !important;
        float: right;
        color: var(--bs-secondary);
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
            /* opacity: 0.8; */
            color: var(--bs-primary);
        }
    }
</style>
