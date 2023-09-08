<script setup lang="ts">
import { ref } from 'vue';
import BookmarkItem from './BookmarkItem.vue'
import ShareBookmarkModal from './ShareBookmarkModal.vue'
import EmptyIndicator from './EmptyIndicator.vue';
import ModalOverlay from '../ModalOverlay.vue';
import Bookmark from '@/types/Bookmark';
import IconButton from '../IconButton.vue';
import { useNotificationStore } from '@/stores/notifications';
import Notification from '@/types/Notification';
import { useBookmarkStore } from '@/stores/bookmarks';
import { useCameraStore } from '@/stores/camera';

const showShareModal = ref(false);
const shareUrl = ref<string>(null);
const modalTitle = ref<string>(null);
const hiddenInput = ref<HTMLInputElement>(null);

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
  const bookmark = new Bookmark(name, cameraStore.getCameraPosition());
  bookmarkStore.add(bookmark);
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

    const text = JSON.stringify(json, null, 2);

    const blob = new Blob([text], {
        type: 'application/json',
    });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'bookmarks.json';
    link.innerHTML = 'Click here to download the file';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
}

async function importBookmarks(file: Blob) {
  const str = await file.text();
  const serializedBookmarks = JSON.parse(str);

  const existingBookmarks = new Set(bookmarkStore.getBookmarks().map(b => b.name));

  let nbImported = 0;
  let nbSkipped = 0;

  serializedBookmarks.forEach((bookmark: any) => {
    if (!existingBookmarks.has(bookmark.title)) {
      bookmarkStore.add(Bookmark.new(bookmark.title, bookmark.url))
      nbImported++;
    } else {
      nbSkipped++;
    }
  });

  notificationStore.push(new Notification('Bookmarks', `${nbImported} bookmarks imported (${nbSkipped} skipped)`, 'success'));
};

async function importBookmarkFile(e: Event) {
  for (const file of (e.target as HTMLInputElement).files)
    importBookmarks(file);
}

function goTo(bookmark: Bookmark) {
  if (bookmark.camera) {
    cameraStore.setCameraPosition(bookmark.camera);
  }
}


</script>

<template>
  <div>
    <EmptyIndicator text="No bookmarks" v-if="bookmarkStore.count === 0" />

    <div>
      <ul class="layers-list-group">
        <BookmarkItem
        v-for="bookmark in bookmarkStore.getBookmarks()"
        :key="bookmark.name"
        :name="bookmark.name"
        v-on:share="shareBookmark(bookmark)"
        v-on:delete="bookmarkStore.remove(bookmark)"
        v-on:goto="goTo(bookmark)"
        />
      </ul>
    </div>

    <div class="button-area">
        <hr>
        <IconButton text="New bookmark" icon="bi-plus-lg" title="Create a new bookmark from the current view" class="btn-primary" @click="() => { addBookmark(); $forceUpdate(); }" />
        <IconButton text="Share view" icon="bi-share" title="Share current view" class="btn-outline-secondary" @click="shareCurrentView" />
        <IconButton title="Export bookmarks to GeoJSON" class="btn-outline-secondary" @click="exportBookmarks" icon="bi-box-arrow-right" text="Export bookmarks"/>

        <!-- Import from GeoJSON -->
        <IconButton title="Import bookmarks from GeoJSON" class="btn-outline-secondary" @click="hiddenInput.click()" icon="bi-box-arrow-left" text="Import bookmarks"/>
        <input ref="hiddenInput" class="btn btn-outline-secondary d-none" type="file" id="formFile" @input="(e) => importBookmarkFile(e)">
    </div>
  </div>

  <!-- FIXME the modal popup background does not take the entire screen -->
  <!-- FIXME the modal popup slightly changes the layout of the page when it appears -->
  <ModalOverlay :show="showShareModal" :title="modalTitle" v-on:close="() => showShareModal = false" >
      <ShareBookmarkModal :url="shareUrl" />
  </ModalOverlay>

</template>

<style scoped>
.import {
  height: 30rem;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

button {
    margin-top: 0.2rem;
    width: 100%;
}
</style>
../.@/controllers/MainController