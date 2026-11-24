<script setup lang="ts">
    import type { Datagroup, Dataset } from '@/types/Dataset';

    import { refAndWatch } from '@/utils/components';

    const { item } = defineProps<{ item: Datagroup | Dataset }>();
    const loading = refAndWatch(item, 'loading');
</script>

<template>
    <Transition name="fade">
        <div v-if="loading" class="loading-indicator" title="Loading..." />
    </Transition>
</template>

<style scoped>
    .loading-indicator {
        width: 3px;
        animation: pulse 1s cubic-bezier(0.37, 0, 0.63, 1) infinite alternate;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.4s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }

    @keyframes pulse {
        from {
            background-color: rgba(var(--bs-primary-rgb), 0.7);
        }
        to {
            background-color: rgba(var(--bs-primary-rgb), 0.2);
        }
    }
</style>
