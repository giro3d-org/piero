<script setup lang="ts">
    import ModalOverlay from '@/components/ModalOverlay.vue';
    import ButtonArea from '@/components/atoms/ButtonArea.vue';
    import ButtonWithIcon from '@/components/atoms/ButtonWithIcon.vue';
    import ImportButton from '@/components/atoms/ImportButton.vue';
    import BookmarkItem from '@/components/panels/BookmarkItem.vue';
    import EmptyIndicator from '@/components/panels/EmptyIndicator.vue';
    import ShareBookmarkModal from '@/components/panels/ShareBookmarkModal.vue';
    import { useBookmarkStore } from '@/stores/bookmarks';
    import { useCameraStore } from '@/stores/camera';
    import { useNotificationStore } from '@/stores/notifications';
    import Bookmark, { type SerializedBookmark } from '@/types/Bookmark';
    import Notification from '@/types/Notification';
    import Download from '@/utils/Download';
    import { ref } from 'vue';

    const showShareModal = ref(false);
    const shareUrl = ref<string | null>(null);
    const modalTitle = ref<string | null>(null);

    const notificationStore = useNotificationStore();
    const bookmarkStore = useBookmarkStore();
    const cameraStore = useCameraStore();

    function shareBookmark(bookmark: Bookmark) {
        shareUrl.value = bookmark.getUrl().toString();
        modalTitle.value = 'Share bookmark';
        showShareModal.value = true;
    }

    function addBookmark() {
        const name = window.prompt('Bookmark name', 'New bookmark');
        if (name != null) {
            const bookmark = new Bookmark(name, cameraStore.getCameraPosition());
            bookmarkStore.add(bookmark);
        }
    }

    function shareCurrentView() {
        const temp = new Bookmark('temp', cameraStore.getCameraPosition());
        shareUrl.value = temp.getUrl().toString();
        modalTitle.value = 'Share current view';
        showShareModal.value = true;
    }

    function exportBookmarks() {
        const json = [];
        for (const bookmark of bookmarkStore.getBookmarks()) {
            json.push({
                title: bookmark.name,
                url: bookmark.getUrl().toString(),
            });
        }
        Download.downloadAsJson(json, 'bookmarks.json');
    }

    async function importBookmarks(file: Blob) {
        const str = await file.text();
        const serializedBookmarks: SerializedBookmark[] = JSON.parse(str);

        const existingBookmarks = new Set(bookmarkStore.getBookmarks().map(b => b.name));

        let nbImported = 0;
        let nbSkipped = 0;

        serializedBookmarks.forEach((bookmark: SerializedBookmark) => {
            if (!existingBookmarks.has(bookmark.title)) {
                bookmarkStore.add(Bookmark.new(bookmark.title, bookmark.url));
                nbImported++;
            } else {
                nbSkipped++;
            }
        });

        notificationStore.push(
            new Notification(
                'Bookmarks',
                `${nbImported} bookmarks imported (${nbSkipped} skipped)`,
                'success',
            ),
        );
    }

    async function importBookmarkFile(files: File[]) {
        for (const file of files) {
            importBookmarks(file);
        }
    }

    function goTo(bookmark: Bookmark) {
        cameraStore.setCameraPosition(bookmark.camera);
    }
</script>

<template>
    <div class="d-flex flex-column h-100">
        <EmptyIndicator text="No bookmarks" v-if="bookmarkStore.count === 0" />

        <ul class="list-group list-group-flush flex-fill overflow-auto">
            <BookmarkItem
                v-for="bookmark in bookmarkStore.getBookmarks()"
                :key="bookmark.name"
                :name="bookmark.name"
                v-on:share="shareBookmark(bookmark)"
                v-on:delete="bookmarkStore.remove(bookmark)"
                v-on:goto="goTo(bookmark)"
            />
        </ul>

        <ButtonArea>
            <ButtonWithIcon
                text="New bookmark"
                icon="bi-plus-lg"
                title="Create a new bookmark from the current view"
                class="btn-primary"
                @click="
                    () => {
                        addBookmark();
                        $forceUpdate();
                    }
                "
            />
            <ButtonWithIcon
                text="Share view"
                icon="bi-share"
                title="Share current view"
                class="btn-outline-secondary"
                @click="shareCurrentView"
            />
            <ButtonWithIcon
                title="Export bookmarks to GeoJSON"
                class="btn-outline-secondary"
                @click="exportBookmarks"
                icon="bi-box-arrow-right"
                text="Export bookmarks"
            />
            <ImportButton
                title="Import bookmarks from GeoJSON"
                text="Import bookmarks"
                @import="importBookmarkFile"
            />
        </ButtonArea>
    </div>

    <!-- FIXME the modal popup background does not take the entire screen -->
    <!-- FIXME the modal popup slightly changes the layout of the page when it appears -->
    <ModalOverlay
        :show="showShareModal"
        :title="modalTitle as string"
        v-on:close="() => (showShareModal = false)"
    >
        <ShareBookmarkModal :url="shareUrl as string" />
    </ModalOverlay>
</template>
