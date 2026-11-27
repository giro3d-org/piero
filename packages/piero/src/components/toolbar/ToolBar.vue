<script setup lang="ts">
    import { usePanelStore } from '@/stores/panels';

    import MonochromeLogo from '../atoms/MonochromeLogo.vue';
    import PanelContainer from './PanelContainer.vue';
    import ToolbarButton from './ToolbarButton.vue';

    const store = usePanelStore();
</script>

<template>
    <div v-if="store.panels.length > 0" class="toolbar base flex-shrink-0 d-flex flex-column">
        <ul id="menu" class="row-2 nav nav-pills flex-column">
            <li class="nav-item mt-2">
                <a href="https://giro3d.org" target="_blank" title="Piero, powered by Giro3D">
                    <MonochromeLogo class="p-2 mb-2 v-100" style="width: 100%; height: 100%" />
                </a>
            </li>

            <template
                :key="panel.id"
                v-for="panel in store.panels.filter(p => p.location === 'top')"
            >
                <ToolbarButton
                    :active="panel.id === store.activePanel?.id"
                    :tourkey="panel.id"
                    :title="panel.title"
                    :icon="panel.icon"
                    @click="
                        () =>
                            store.setActivePanel(
                                store.activePanel?.id === panel.id ? null : panel.id,
                            )
                    "
                />
            </template>
        </ul>

        <div class="row flex-grow-1"></div>

        <ul id="menu-bottom" class="row-8 nav nav-pills flex-column">
            <template
                :key="panel.id"
                v-for="panel in store.panels.filter(p => p.location === 'bottom')"
            >
                <div class="float-end">
                    <ToolbarButton
                        :active="panel.id === store.activePanel?.id"
                        :tourkey="panel.id"
                        :title="panel.title"
                        :icon="panel.icon"
                        @click="
                            () =>
                                store.setActivePanel(
                                    store.activePanel?.id === panel.id ? null : panel.id,
                                )
                        "
                    />
                </div>
            </template>
        </ul>
    </div>

    <PanelContainer class="panel base" />
</template>

<style scoped>
    li {
        margin: 0.2rem;
    }

    .base {
        background-color: var(--bs-body-bg);
    }

    .toolbar {
        width: 3.5rem;
        height: 100%;
    }

    .panel {
        position: absolute;
        height: 100vh;
        left: 3.5rem;
        max-width: 30rem;
        min-width: 20rem;
        z-index: 1;
    }
</style>
