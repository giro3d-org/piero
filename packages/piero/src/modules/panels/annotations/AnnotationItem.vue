<script setup lang="ts">
    import { onMounted, onUnmounted, ref } from 'vue';

    import type { AnnotationType } from '@/configuration/annotation';
    import type Annotation from '@/types/Annotation';

    import Icon from '@/components/atoms/Icon.vue';
    import IconList from '@/components/atoms/IconList.vue';
    import AttributeItem from '@/components/AttributeItem.vue';
    import { showContextMenu } from '@/components/contextmenu/contextMenu';
    import EmptyIndicator from '@/components/panels/EmptyIndicator.vue';
    import VisibilityControl from '@/components/VisibilityControl.vue';

    const props = defineProps<{
        annotation: Annotation;
        visible: boolean;
    }>();

    const icons: Record<AnnotationType, string> = {
        linestring: 'fg-polyline-pt',
        multipoint: 'fg-multipoint',
        point: 'fg-point',
        polygon: 'fg-polygon-pt',
    };

    const titles: Record<AnnotationType, string> = {
        linestring: 'Line',
        multipoint: 'Points',
        point: 'Point',
        polygon: 'Polygon',
    };

    const emits = defineEmits([
        'edit',
        'stop-edit',
        'delete',
        'download',
        'update:visible',
        'zoom',
    ]);

    const isEditing = ref(props.annotation.isEditing);

    const onIsEditingChanged = (): void => {
        isEditing.value = props.annotation.isEditing;
    };

    onMounted(() => {
        props.annotation.addEventListener('isEditing', onIsEditingChanged);
    });

    onUnmounted(() => {
        props.annotation.removeEventListener('isEditing', onIsEditingChanged);
    });

    function onContextMenu(e: MouseEvent): void {
        showContextMenu({
            e,
            items: [
                {
                    icon: 'bi-zoom-in',
                    label: 'Zoom to annotation',
                    onClick: (): void => emits('zoom', props.annotation),
                },
                {
                    icon: 'bi-trash',
                    label: 'Delete annotation',
                    onClick: (): void => emits('delete', props.annotation),
                },
                {
                    icon: 'bi-download',
                    label: 'Download...',
                    onClick: (): void => emits('download', props.annotation),
                },
                {
                    icon: 'bi-pencil',
                    label: isEditing.value ? 'Exit edition mode' : 'Edit geometry',
                    onClick: (): void =>
                        isEditing.value
                            ? emits('stop-edit', props.annotation)
                            : emits('edit', props.annotation),
                },
            ],
        });
    }
</script>

<template>
    <li class="list-group-item item" @contextmenu="onContextMenu($event)">
        <div class="d-flex">
            <VisibilityControl
                :visible="visible"
                v-on:update:visible="v => $emit('update:visible', v)"
            />

            <IconList class="text-body-tertiary me-1">
                <Icon :icon="icons[annotation.type]" :title="titles[annotation.type]" />
            </IconList>

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
