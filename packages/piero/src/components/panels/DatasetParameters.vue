<script setup lang="ts">
    import type { Dataset } from '@/types/Dataset';

    import { useDatasetStore } from '@/stores/datasets';
    import { refAndWatch } from '@/utils/Components';

    import ButtonWithIcon from '../atoms/ButtonWithIcon.vue';
    import Slider from '../atoms/Slider.vue';
    import CheckboxToggle from '../CheckboxToggle.vue';
    import { datasetTitles } from '../Configuration';

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
    <ButtonWithIcon
        title="Back to datasets"
        text="Back to datasets"
        icon="bi-arrow-left"
        class="btn-outline-secondary"
        @click="$emit('backToDatasets')"
    />
    <div class="card mt-3">
        <div class="card-header">
            {{ dataset.name }}
        </div>
        <form class="card-body">
            <fieldset>
                <div class="mb-2 row">
                    <span class="float-start col">Type</span>
                    <span class="badge text-bg-secondary col-auto">{{
                        datasetTitles[dataset.config.type]
                    }}</span>
                </div>

                <hr />

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
</template>
