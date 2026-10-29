<script setup lang="ts">
    import { usePanelStore } from '@/stores/panels';

    import MonochromeLogo from '../atoms/MonochromeLogo.vue';
    import ToolbarButton from './ToolbarButton.vue';

    const panels = usePanelStore();
</script>

<template>
    <div class="toolbar">
        <ul id="menu" class="nav nav-pills flex-column">
            <li class="nav-item mt-2">
                <a href="https://giro3d.org" target="_blank" title="Piero, powered by Giro3D">
                    <MonochromeLogo class="p-2 mb-2 v-100" style="width: 100%; height: 100%" />
                </a>
            </li>

            <template :key="panel.id" v-for="panel in panels.panels">
                <ToolbarButton
                    :active="panel.id === panels.activePanel?.id"
                    :tourkey="panel.id"
                    :title="panel.title"
                    :icon="panel.icon"
                    @click="
                        () =>
                            panels.setActivePanel(
                                panels.activePanel?.id === panel.id ? null : panel.id,
                            )
                    "
                />
            </template>
        </ul>
    </div>
</template>

<style scoped>
    li {
        margin: 0.2rem;
    }
</style>
