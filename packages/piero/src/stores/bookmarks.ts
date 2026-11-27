import type geojson from 'geojson';

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { Bookmark } from '@/configuration/bookmark';

import { toGeojsonFeature } from '@/configuration/bookmark';
import { getConfig } from '@/configurationLoader';
import { GLOBAL_EVENT_DISPATCHER } from '@/events';

export const useBookmarkStore = defineStore('bookmarks', () => {
    const bookmarks = ref<Set<Bookmark>>(new Set(getConfig().bookmarks ?? []));
    const count = computed(() => bookmarks.value.size);

    function add(bookmark: Bookmark): void {
        bookmarks.value.add(bookmark);
        GLOBAL_EVENT_DISPATCHER.dispatchEvent({ type: 'bookmark-added', value: bookmark });
    }

    function remove(bookmark: Bookmark): void {
        bookmarks.value.delete(bookmark);
        GLOBAL_EVENT_DISPATCHER.dispatchEvent({ type: 'bookmark-removed', value: bookmark });
    }

    function clear(): void {
        bookmarks.value.clear();
    }

    function getBookmarks(): Bookmark[] {
        return [...bookmarks.value];
    }

    function exportAsFeatureCollection(): geojson.FeatureCollection {
        return {
            features: [...bookmarks.value].map(toGeojsonFeature),
            type: 'FeatureCollection',
        };
    }

    return { add, clear, count, exportAsFeatureCollection, getBookmarks, remove };
});

export type BookmarkStore = ReturnType<typeof useBookmarkStore>;
