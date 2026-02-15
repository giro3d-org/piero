import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import { defineStore } from 'pinia';
import { Vector3 } from 'three';
import { computed, ref } from 'vue';

import { getLookAtTarget } from '@/configuration/lookAt';
import { getConfig } from '@/configurationLoader';
import { GLOBAL_EVENT_DISPATCHER } from '@/events';
import Bookmark from '@/types/Bookmark';
import CameraPosition from '@/types/CameraPosition';

function buildInitialList(): Bookmark[] {
    const config = getConfig();

    if (config.bookmarks == null) {
        return [];
    }

    const result: Bookmark[] = [];

    for (const conf of config.bookmarks) {
        const lookAt = conf.lookAt;
        const pos = new Coordinates('EPSG:4326', lookAt.longitude, lookAt.latitude, lookAt.altitude)
            .as(config.scene.crs)
            .toVector3();

        const target = getLookAtTarget(pos, lookAt);

        const title = conf.title;

        const cameraPosition = new CameraPosition(
            new Vector3(pos.x, pos.y, pos.z),
            new Vector3(target.x, target.y, target.z),
            new Vector3(0, 0, 0),
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
