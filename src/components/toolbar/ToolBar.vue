<script setup lang="ts">
    import ToolbarButton from './ToolbarButton.vue';
    import Configuration from '../Configuration';

    defineProps<{
        active: string | null;
    }>();
    defineEmits(['selected']);

    const panels = Configuration.panels;
</script>

<template>
    <div class="toolbar">
        <ul id="menu" class="nav nav-pills flex-column">
            <li class="nav-item mt-2">
                <a href="https://giro3d.org" target="_blank">
                    <img src="/giro3d_logo_compact.svg" height="48" class="mb-3" />
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
