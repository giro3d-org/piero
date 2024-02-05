<script setup lang="ts">
    defineProps(['url', 'name']);
    defineEmits(['delete', 'share', 'goto']);
</script>

<template>
    <li class="list-group-item item d-flex d-flex-end">
        <a class="bookmark" href="#" @click="$emit('goto')">{{ name }}</a>
        <a href="#" class="icon" title="Share this bookmark" @click="$emit('share')">
            <i class="bi bi-share"></i>
        </a>
        <a href="#" class="icon" title="Delete this bookmark" @click="$emit('delete')">
            <i class="bi bi-trash"></i>
        </a>
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
