import { defineStore } from 'pinia';
import { ref } from 'vue';
import z from 'zod';

export const ThemeSchema = z.union([z.literal('light'), z.literal('dark'), z.literal('system')]);
export type Theme = z.infer<typeof ThemeSchema>;

export const PreferencesSchema = z.object({
    theme: ThemeSchema,
});
export type Preferences = z.infer<typeof PreferencesSchema>;

const LOCAL_STORAGE_KEY = 'preferences';

const defaultPreferences: Preferences = {
    theme: 'light',
};

function loadPreferencesFromLocalStorage(): Preferences {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local == null) {
        return defaultPreferences;
    }

    try {
        return PreferencesSchema.parse(JSON.parse(local));
    } catch (e) {
        console.warn('Could not load preferences', e);
        return defaultPreferences;
    }
}

export const usePreferenceStore = defineStore('preferences', () => {
    const systemTheme: 'dark' | 'light' = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

    const preferences = ref<Preferences>(loadPreferencesFromLocalStorage());

    function saveToLocalStorage(): void {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(preferences.value));
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
        setUserTheme,
    };
});

export type PreferencesStore = ReturnType<typeof usePreferenceStore>;
