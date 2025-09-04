<script setup lang="ts">
    import type Annotation from '@/types/Annotation';
    import { onMounted, onUnmounted, ref } from 'vue';
    import AttributeItem from '../AttributeItem.vue';
    import VisibilityControl from '../VisibilityControl.vue';
    import EmptyIndicator from './EmptyIndicator.vue';

    const props = defineProps<{
        visible: boolean;
        annotation: Annotation;
    }>();

    defineEmits(['edit', 'stop-edit', 'delete', 'download', 'update:visible', 'zoom']);

    const isEditing = ref(props.annotation.isEditing);

    const onIsEditingChanged = () => (isEditing.value = props.annotation.isEditing);

    onMounted(() => {
        props.annotation.addEventListener('isEditing', onIsEditingChanged);
    });

    onUnmounted(() => {
        props.annotation.removeEventListener('isEditing', onIsEditingChanged);
    });
</script>

<template>
    <li class="list-group-item item">
        <div class="d-flex">
            <VisibilityControl
                :visible="visible"
                v-on:update:visible="v => $emit('update:visible', v)"
            />

            <a class="title" :title="annotation.title" href="#" @click="$emit('zoom')">{{
                annotation.title
            }}</a>

            <div class="icons">
                <a
                    href="#"
                    class="icon"
                    title="Attribute table"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#collapse-${annotation.uuid}`"
                    aria-expanded="false"
                    aria-controls="`#collapse-${annotation.uuid}`"
                >
                    <i class="bi bi-card-list"></i>
                </a>
                <a
                    href="#"
                    class="icon"
                    title="Edit geometry (right-click to exit edition, or press Escape to cancel modifications)"
                    @click="isEditing ? $emit('stop-edit') : $emit('edit')"
                >
                    <i :class="`bi bi-pencil ${isEditing ? 'text-primary' : ''}`"></i>
                </a>
                <a href="#" class="icon" title="Download..." @click="$emit('download')">
                    <i class="bi bi-download"></i>
                </a>
                <a href="#" class="icon" title="Delete" @click="$emit('delete')">
                    <i class="bi bi-trash"></i>
                </a>
            </div>
        </div>

        <div class="collapse m-2" :id="`collapse-${annotation.uuid}`">
            <EmptyIndicator
                text="No properties"
                v-if="Object.entries(annotation.properties).length === 0"
            />
            <table class="table table-striped table-sm table-responsive-sm" v-else>
                <thead>
                    <tr>
                        <th>Key</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <AttributeItem
                        v-for="[key, value] of Object.entries(annotation.properties)"
                        :key="key"
                        :attr-name="key"
                        :attr-value="value"
                    />
                </tbody>
            </table>
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
