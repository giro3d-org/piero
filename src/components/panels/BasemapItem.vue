<script setup lang="ts">
    import OpacitySlider from '@/components/OpacitySlider.vue';
    import VisibilityControl from '@/components/VisibilityControl.vue';
    import Icon from '@/components/atoms/Icon.vue';
    import IconList from '@/components/atoms/IconList.vue';
    import ListLabel from '@/components/atoms/ListLabel.vue';
    import type { LayerType } from '@/types/configuration/layers';

    defineProps<{
        type: LayerType | 'graticule';
        opacity: number;
        visible: boolean;
        isLoading: boolean;
        hasOpacitySlider: boolean;
        name: string;
    }>();

    defineEmits(['update:opacity', 'update:visible']);

    const icons: Record<LayerType | 'graticule', string> = {
        elevation: 'fg-profile',
        color: 'fg-landcover-map',
        mask: 'bi-mask',
        graticule: 'fg-grid',
    };
    const iconTitles: Record<LayerType | 'graticule', string> = {
        elevation: 'Elevation layer',
        color: 'Color layer',
        mask: 'Mask layer',
        graticule: 'Graticule',
    };
</script>

<template>
    <li class="list-group-item">
        <div class="d-flex">
            <IconList class="me-1 text-body-tertiary">
                <Icon :icon="icons[type]" :title="iconTitles[type]" />
            </IconList>
            <VisibilityControl
                :visible="visible"
                v-on:update:visible="v => $emit('update:visible', v)"
            />
            <ListLabel :title="name" class="label" :class="!visible ? 'disabled' : null" />
            <OpacitySlider
                v-if="hasOpacitySlider"
                class="opacity-slider"
                :class="!visible ? 'disabled' : null"
                :opacity="opacity"
                @update:opacity="v => $emit('update:opacity', v)"
            />
        </div>
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
