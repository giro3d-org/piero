<script setup lang="ts">
    import type Measure from '@/types/Measure';
    import VisibilityControl from '../VisibilityControl.vue';

    defineProps<{
        visible: boolean;
        measure: Measure;
    }>();
    defineEmits(['delete', 'download', 'update:visible', 'zoom']);
</script>

<template>
    <li class="list-group-item item">
        <div class="d-flex">
            <VisibilityControl
                :visible="visible"
                v-on:update:visible="v => $emit('update:visible', v)"
            />

            <a class="title" :title="measure.title" href="#" @click="$emit('zoom')"
                >{{ measure.title }} ({{ measure.object.length.toFixed(2) }}m)</a
            >

            <div class="icons">
                <a href="#" class="icon" title="Delete" @click="$emit('delete')">
                    <i class="bi bi-trash"></i>
                </a>
            </div>
        </div>
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

    .icons {
        display: flex;
    }

    .title {
        white-space: nowrap;
        display: block;
        width: 100% !important;
        margin-left: 1rem;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .icon {
        padding-left: 0.4rem;
        color: rgb(180, 180, 180);
    }

    @media (hover: hover) {
        .icon:hover {
            color: rgb(75, 75, 75);
        }
    }
</style>
