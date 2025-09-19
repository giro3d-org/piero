import { defineStore } from 'pinia';
import { Vector3 } from 'three';
import { computed, ref } from 'vue';

import { getConfig } from '@/config-loader';
import { GLOBAL_EVENT_DISPATCHER } from '@/events';
import Bookmark from '@/types/Bookmark';
import CameraPosition from '@/types/CameraPosition';

function buildInitialList(): Bookmark[] {
    const config = getConfig();
    const result: Bookmark[] = [];

    for (const conf of config.bookmarks) {
        const pos = conf.position;
        const target = conf.target;
        const fo = conf.focalOffset;
        const title = conf.title;

        const cameraPosition = new CameraPosition(
            new Vector3(pos.x, pos.y, pos.z),
            new Vector3(target.x, target.y, target.z),
            new Vector3(fo.x, fo.y, fo.z),
        );

        result.push(new Bookmark(title, cameraPosition));
    }

    return result;
}

export const useBookmarkStore = defineStore('bookmarks', () => {
    const bookmarks = ref<Set<Bookmark>>(new Set(buildInitialList()));
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

    return { add, clear, count, getBookmarks, remove };
});

export type BookmarkStore = ReturnType<typeof useBookmarkStore>;
