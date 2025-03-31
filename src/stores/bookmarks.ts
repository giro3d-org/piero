import getConfig from '@/config-loader';
import Bookmark from '@/types/Bookmark';
import CameraPosition from '@/types/CameraPosition';
import { defineStore } from 'pinia';
import { Vector3 } from 'three';
import { computed, ref } from 'vue';

function buildInitialList() {
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

    function add(bookmark: Bookmark) {
        bookmarks.value.add(bookmark);
    }

    function remove(bookmark: Bookmark) {
        bookmarks.value.delete(bookmark);
    }

    function getBookmarks(): Bookmark[] {
        return [...bookmarks.value];
    }

    return { count, add, remove, getBookmarks };
});
