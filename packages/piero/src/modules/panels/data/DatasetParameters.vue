<script setup lang="ts">
    import type { Dataset } from '@/types/Dataset';

    import ButtonWithIcon from '@/components/atoms/ButtonWithIcon.vue';
    import Slider from '@/components/atoms/Slider.vue';
    import CheckboxToggle from '@/components/CheckboxToggle.vue';
    import { datasetTitles } from '@/components/Configuration';
    import { useDatasetStore } from '@/stores/datasets';
    import { refAndWatch } from '@/utils/components';

    const props = defineProps<{
        dataset: Dataset;
    }>();

    defineEmits<{
        backToDatasets: [];
    }>();

    const ds = props.dataset;
    const store = useDatasetStore();
    const opacity = refAndWatch(props.dataset, 'opacity');
    const visible = refAndWatch(props.dataset, 'visibleSelf');
</script>

<template>
    <div class="card">
        <div class="card-header">
            <span class="fw-bold">{{ dataset.name }}</span>
            <span :title="dataset.config.type" class="badge text-bg-secondary float-end">{{
                datasetTitles[dataset.config.type]
            }}</span>
        </div>
        <form class="card-body">
            <fieldset>
                <div class="container">
                    <div class="row">
                        <CheckboxToggle
                            :model-value="visible"
                            @update:model-value="v => store.setVisible(ds, v)"
                            title="Visible"
                            >Visible</CheckboxToggle
                        >
                    </div>

                    <Slider
                        class="row"
                        :model-value="opacity"
                        label="Opacity"
                        :min="0"
                        :step="0.01"
                        :max="1"
                        @update:model-value="v => store.setOpacity(ds, v)"
                    />
                </div>
            </fieldset>
        </form>
    </div>

    <div class="flex-grow-1" />

    <ButtonWithIcon
        title="Back to datasets"
        text="Back to datasets"
        icon="bi-arrow-left"
        class="btn-outline-secondary mt-3"
        @click="$emit('backToDatasets')"
    />
</template>
