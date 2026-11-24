import { defineStore } from 'pinia';
import { ref } from 'vue';
import z from 'zod';

export const ThemeSchema = z.union([z.literal('light'), z.literal('dark'), z.literal('system')]);
export type Theme = z.infer<typeof ThemeSchema>;

export const SettingsSchema = z.object({
    theme: ThemeSchema,
});
export type Settings = z.infer<typeof SettingsSchema>;

const LOCAL_STORAGE_KEY = 'settings';

const defaultSettings: Settings = {
    theme: 'light',
};

function loadSettingsFromLocalStorage(): Settings {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local == null) {
        return defaultSettings;
    }

    try {
        return SettingsSchema.parse(JSON.parse(local));
    } catch (e) {
        console.warn('Could not load Piero settings', e);
        return defaultSettings;
    }
}

export const useSettingsStore = defineStore('settings', () => {
    const systemTheme: 'dark' | 'light' = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

    const rootElement = ref<HTMLElement | null>(null);

    const preferences = ref<Settings>(loadSettingsFromLocalStorage());

    function saveToLocalStorage(): void {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(preferences.value));
    }

    function setRootElement(element: HTMLElement): void {
        rootElement.value = element;
    }

    function getTheme(): 'dark' | 'light' {
        const userTheme = preferences.value.theme;

        switch (userTheme) {
            case 'dark':
            case 'light':
                return userTheme;
            case 'system':
            case undefined:
                return systemTheme;
        }
    }

    function getUserTheme(): Theme {
        return preferences.value.theme;
    }

    function setUserTheme(theme: Theme): void {
        preferences.value.theme = theme;

        saveToLocalStorage();
    }

    return {
        getTheme,
        getUserTheme,
        setRootElement,
        setUserTheme,
    };
});

export type SettingsStore = ReturnType<typeof useSettingsStore>;
