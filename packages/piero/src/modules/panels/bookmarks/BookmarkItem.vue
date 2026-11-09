<script setup lang="ts">
    import { showContextMenu } from '@/components/contextmenu/contextMenu';

    defineProps(['url', 'name']);
    const emits = defineEmits(['delete', 'share', 'goto']);

    function onContextMenu(e: MouseEvent): void {
        showContextMenu({
            e,
            items: [
                {
                    icon: 'bi-zoom-in',
                    label: 'Go to bookmark',
                    onClick: (): void => emits('goto'),
                },
                {
                    icon: 'bi-trash',
                    label: 'Delete',
                    onClick: (): void => emits('delete'),
                },
                {
                    icon: 'bi-share',
                    label: 'Share...',
                    onClick: (): void => emits('share'),
                },
            ],
        });
    }
</script>

<template>
    <li class="list-group-item item d-flex d-flex-end" @contextmenu="onContextMenu($event)">
        <a class="bookmark" href="#" @click="$emit('goto')">{{ name }}</a>
    </li>
</template>

<style scoped>
    .item {
        padding: 0.1rem;
    }

    a {
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    .bookmark {
        width: 100%;
    }

    .icon {
        margin-left: 0.2rem;
        width: 1rem !important;
        color: rgb(180, 180, 180);
    }

    @media (hover: hover) {
        .icon:hover {
            color: rgb(75, 75, 75);
        }
    }

    .spinner-container {
        width: 1rem;
    }

    .layer-name {
        width: 40%;
        margin-left: 1rem;
    }

    .slider {
        display: flex;
    }
</style>
