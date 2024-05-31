<script setup lang="ts">
    import Icon from '@/components/atoms/Icon.vue';
    import IconList from '@/components/atoms/IconList.vue';
    import IconListButton from '@/components/atoms/IconListButton.vue';
    import ListLabelButton from '@/components/atoms/ListLabelButton.vue';
    import OpacitySlider from '@/components/OpacitySlider.vue';
    import VisibilityControl from '@/components/VisibilityControl.vue';

    defineProps<{
        visible: boolean;
        name: string;
        opacity: number;
    }>();
    defineEmits(['update:visible', 'update:opacity', 'update:move-up', 'update:move-down', 'zoom']);
</script>

<template>
    <li class="list-group-item d-flex">
        <IconList class="me-1 text-body-tertiary">
            <Icon icon="fg-contour-map" title="Overlay" />
        </IconList>
        <VisibilityControl :visible="visible" @update:visible="v => $emit('update:visible', v)" />
        <ListLabelButton
            class="label"
            :disabled="!visible"
            :title="`Zoom to ${name}`"
            :text="name"
            @click="$emit('zoom')"
        />

        <OpacitySlider
            class="opacity-slider"
            :class="!visible ? 'disabled' : null"
            :opacity="opacity"
            size="small"
            @update:opacity="v => $emit('update:opacity', v)"
        />
        <IconList class="ms-1">
            <IconListButton title="Move up" icon="bi-arrow-up" @click="$emit('update:move-up')" />
            <IconListButton
                title="Move down"
                icon="bi-arrow-down"
                @click="$emit('update:move-down')"
            />
        </IconList>
    </li>
</template>

<style scoped>
    .label {
        min-width: 50%;
    }

    .opacity-slider {
        min-width: 100px;
    }
</style>
