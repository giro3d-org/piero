<script setup lang="ts">
    import OpacitySlider from '@/components/OpacitySlider.vue';
    import { DatasetState, type Dataset } from '@/types/Dataset';

    import { refAndWatch } from '@/utils/Components';
    import { useGraticuleStore } from './store';

    const props = defineProps<{
        dataset: Dataset;
    }>();

    const state = refAndWatch(props.dataset, 'state');
    const store = useGraticuleStore();
</script>

<template>
    <div v-if="state === DatasetState.Loaded">
        <span>Opacity</span>
        <OpacitySlider
            size="small"
            title="Opacity"
            :opacity="store.opacity"
            @update:opacity="v => store.setOpacity(v)"
        />
    </div>
</template>

<style scoped>
    ul {
        font-size: smaller;
    }
</style>
