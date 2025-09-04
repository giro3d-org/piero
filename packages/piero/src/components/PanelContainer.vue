<script setup lang="ts">
    import type { PanelType } from './Configuration';
    import getConfigurationPanels from './Configuration';

    import AboutPanel from './panels/AboutPanel.vue';
    import AnalysisPanel from './panels/AnalysisPanel.vue';
    import AnnotationPanel from './panels/AnnotationPanel.vue';
    import BookmarkPanel from './panels/BookmarkPanel.vue';
    import DatasetPanel from './panels/DatasetPanel.vue';
    import MeasurementPanel from './panels/MeasurementPanel.vue';

    defineProps<{
        /**
         * The name of the panel (must match the tooltip
         * of the corresponding tool in the toolbar)
         */
        selected: PanelType | null;
    }>();

    const panels = getConfigurationPanels();
    const gitCommit = import.meta.env.VITE_GIT_COMMIT;
</script>

<template>
    <div class="panel" id="panel-container">
        <h5 class="title">
            {{ panels.find(p => p.key === selected)?.title }}
            <span
                v-if="selected === 'about'"
                class="badge text-bg-primary rounded-pill float-end"
                title="Version"
                >Version: {{ gitCommit }}</span
            >
        </h5>
        <div class="content">
            <DatasetPanel v-if="selected === 'datasets'" />
            <AboutPanel v-if="selected === 'about'" />
            <BookmarkPanel v-if="selected === 'bookmarks'" />
            <AnalysisPanel v-if="selected === 'analysis'" />
            <AnnotationPanel v-if="selected === 'annotations'" />
            <MeasurementPanel v-if="selected === 'measures'" />
        </div>
    </div>
</template>

<style scoped>
    .title {
        margin: 1rem;
    }

    .content {
        flex-grow: 1;
        overflow: auto;
        margin-left: 0.5rem;
        margin-right: 0.5rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }

    .panel {
        border-color: var(--bs-border-color);
        border-width: 0 2px 0 2px;
        border-style: solid;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
</style>
