<script setup lang="ts">
    import type geojson from 'geojson';

    import type { Bookmark } from '@/configuration/bookmark';

    import ButtonArea from '@/components/atoms/ButtonArea.vue';
    import ButtonWithIcon from '@/components/atoms/ButtonWithIcon.vue';
    import ImportButton from '@/components/atoms/ImportButton.vue';
    import EmptyIndicator from '@/components/panels/EmptyIndicator.vue';
    import PanelHeader from '@/components/panels/PanelHeader.vue';
    import { fromGeojsonFeature } from '@/configuration/bookmark';
    import { useBookmarkStore } from '@/stores/bookmarks';
    import { useCameraStore } from '@/stores/camera';
    import { useGiro3dStore } from '@/stores/giro3d';
    import { useNotificationStore } from '@/stores/notifications';
    import CameraPosition from '@/types/CameraPosition';
    import Download from '@/utils/Download';

    import BookmarkItem from './BookmarkItem.vue';

    const notificationStore = useNotificationStore();
    const bookmarkStore = useBookmarkStore();
    const cameraStore = useCameraStore();
    const giro3d = useGiro3dStore();

    function addBookmark(): void {
        const name = window.prompt('Bookmark name', 'New bookmark');
        if (name != null) {
            const lookAt = cameraStore.getCameraPosition().toLookAt(giro3d.getCRS());

            const bookmark: Bookmark = {
                lookAt,
                title: name,
            };

            bookmarkStore.add(bookmark);
        }
    }

    function exportBookmarks(): void {
        Download.downloadAsJson(bookmarkStore.exportAsFeatureCollection(), 'bookmarks.json');
    }

    function goTo(bookmark: Bookmark): void {
        cameraStore.setCameraPosition(CameraPosition.fromLookAt(giro3d.getCRS(), bookmark.lookAt));
    }

    function importBookmarkFile(files: File[]): void {
        for (const file of files) {
            void importBookmarks(file);
        }
    }

    async function importBookmarks(file: Blob): Promise<void> {
        const str = await file.text();
        const featureCollection: geojson.FeatureCollection = JSON.parse(str);
        const bookmarks = featureCollection.features.map(fromGeojsonFeature);

        const existingBookmarks = new Set(bookmarkStore.getBookmarks().map(b => b.title));

        let nbImported = 0;
        let nbSkipped = 0;

        bookmarks.forEach((bookmark: Bookmark) => {
            if (!existingBookmarks.has(bookmark.title)) {
                bookmarkStore.add(bookmark);
                nbImported++;
            } else {
                nbSkipped++;
            }
        });

        notificationStore.push({
            level: 'success',
            text: `${nbImported} bookmarks imported (${nbSkipped} skipped)`,
            title: 'Bookmarks',
        });
    }
</script>

<template>
    <PanelHeader icon="bi-bookmarks" title="Bookmarks" />

    <EmptyIndicator text="No bookmarks" v-if="bookmarkStore.count === 0" class="flex-grow-1" />

    <ul class="list-group list-group-flush flex-grow-1 overflow-auto">
        <BookmarkItem
            v-for="bookmark in bookmarkStore.getBookmarks()"
            :key="bookmark.title"
            :name="bookmark.title"
            v-on:delete="bookmarkStore.remove(bookmark)"
            v-on:goto="goTo(bookmark)"
        />
    </ul>

    <ButtonArea>
        <ButtonWithIcon
            text="New bookmark"
            icon="bi-plus-lg"
            title="Create a new bookmark from the current view"
            class="btn-primary my-1"
            @click="
                () => {
                    addBookmark();
                    $forceUpdate();
                }
            "
        />
        <ButtonWithIcon
            title="Export bookmarks to GeoJSON"
            class="btn-outline-secondary my-1"
            @click="exportBookmarks"
            icon="bi-box-arrow-right"
            text="Export bookmarks"
        />
        <ImportButton
            class="my-1"
            title="Import bookmarks from GeoJSON"
            text="Import bookmarks"
            @import="importBookmarkFile"
        />
    </ButtonArea>
</template>
