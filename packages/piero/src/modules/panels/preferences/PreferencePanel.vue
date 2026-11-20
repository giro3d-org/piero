<script setup lang="ts">
    import PanelHeader from '@/components/panels/PanelHeader.vue';

    import { ThemeSchema, useSettingsStore } from '@/stores/settings';

    const store = useSettingsStore();
    const theme = store.getUserTheme();

    function onThemeChange(e: InputEvent): void {
        const target = e.target as HTMLInputElement;
        const newTheme = ThemeSchema.parse(target.value);

        store.setUserTheme(newTheme);
    }
</script>

<template>
    <PanelHeader icon="bi-gear" title="Settings" />

    <div class="input-group mb-3">
        <span class="input-group-text">Theme</span>
        <select
            class="form-select"
            @input="onThemeChange($event)"
            aria-label="Select theme"
            v-model="theme"
        >
            <option value="system" :selected="theme === 'system'">System</option>
            <option value="dark" :selected="theme === 'dark'">Dark</option>
            <option value="light" :selected="theme === 'light'">Light</option>
        </select>
    </div>
</template>
