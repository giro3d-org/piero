<script setup lang="ts">
    import getConfigurationPanels from '../Configuration';
    import ToolbarButton from './ToolbarButton.vue';

    defineProps<{
        active: string | null;
    }>();
    defineEmits(['selected']);

    const panels = getConfigurationPanels();
</script>

<template>
    <div class="toolbar">
        <ul id="menu" class="nav nav-pills flex-column">
            <li class="nav-item mt-2">
                <a href="https://giro3d.org" target="_blank" title="Piero, powered by Giro3D">
                    <img
                        src="/piero_logo_compact.png"
                        alt="Piero, powered by Giro3D"
                        class="mb-3 w-100 p-1"
                    />
                </a>
            </li>

            <template v-for="panel in panels">
                <ToolbarButton
                    v-if="panel.enabled"
                    :active="active === panel.key"
                    :key="panel.key"
                    :tourkey="panel.key"
                    :title="panel.title"
                    :icon="panel.icon"
                    @click="$emit('selected', panel.key)"
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
