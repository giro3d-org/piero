<script setup lang="ts">
    import OpacitySlider from '@/components/OpacitySlider.vue';
    import VisibilityControl from '@/components/VisibilityControl.vue';
    import ListLabel from '@/components/atoms/ListLabel.vue';

    defineProps<{
        opacity: number;
        visible: boolean;
        isLoading: boolean;
        hasOpacitySlider: boolean;
        name: string;
    }>();

    defineEmits(['update:opacity', 'update:visible']);
</script>

<template>
    <li class="list-group-item d-flex">
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
    </li>
</template>

<style scoped>
    .label {
        min-width: 50%;
    }

    .opacity-slider {
        min-width: 150px;
    }
</style>
