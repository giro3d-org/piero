<script setup lang="ts">
    import type { LayerType } from '@/types/configuration/layers';

    import Icon from '@/components/atoms/Icon.vue';
    import IconList from '@/components/atoms/IconList.vue';
    import ListLabel from '@/components/atoms/ListLabel.vue';
    import OpacitySlider from '@/components/OpacitySlider.vue';
    import VisibilityControl from '@/components/VisibilityControl.vue';

    defineProps<{
        hasOpacitySlider: boolean;
        isLoading: boolean;
        name: string;
        opacity: number;
        type: 'graticule' | LayerType;
        visible: boolean;
    }>();

    defineEmits(['update:opacity', 'update:visible']);

    const icons: Record<'graticule' | LayerType, string> = {
        color: 'fg-landcover-map',
        elevation: 'fg-profile',
        graticule: 'fg-grid',
        mask: 'bi-mask',
    };
    const iconTitles: Record<'graticule' | LayerType, string> = {
        color: 'Color layer',
        elevation: 'Elevation layer',
        graticule: 'Graticule',
        mask: 'Mask layer',
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
