<script setup lang="ts">
import { ref } from 'vue';
import Bookmarks from '../controllers/BookmarkController'
import BookmarkItem from './BookmarkItem.vue'
import ShareBookmarkModal from './ShareBookmarkModal.vue'
import EmptyIndicator from './EmptyIndicator.vue';
import ModalOverlay from '../ModalOverlay.vue';
import Bookmark from '../../types/Bookmark';
import MainController from '../controllers/MainController';

const bookmarks = Bookmarks.getBookmarks()
const showShareModal = ref(false);
const shareUrl = ref<string>(null);
const modalTitle = ref<string>(null);

function shareBookmark(bookmark: Bookmark) {
  shareUrl.value = bookmark.getUrl().toString();
  modalTitle.value = 'Share bookmark';
  showShareModal.value = true;
}

function addBookmark() {
  const name = window.prompt('Bookmark name', 'New bookmark');
  Bookmarks.addBookmarkFromCurrentPosition(name);
}

function shareCurrentView() {
  const temp = new Bookmark('temp', MainController.get().camera.getCameraPosition());
  shareUrl.value = temp.getUrl().toString();
  modalTitle.value = 'Share current view';
  showShareModal.value = true;
}

function exportBookmarks() {
  const json = [];
    for (const bookmark of Bookmarks.getBookmarks()) {
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

</script>

<template>
  <div>
    <EmptyIndicator text="No bookmarks" :visible="bookmarks.length === 0" />

    <div>
      <ul class="layers-list-group">
        <BookmarkItem
        v-for="bookmark in bookmarks"
        :key="bookmark.name"
        :name="bookmark.name"
        v-on:share="() => shareBookmark(bookmark)"
        v-on:delete="() => { bookmark.delete(); $forceUpdate() }"
        v-on:goto="() => { bookmark.goTo(); $forceUpdate() }"
        />
      </ul>
    </div>

    <div class="button-area">
        <hr>
        <button title="New bookmark..." class="btn btn-primary" @click="() => { addBookmark(); $forceUpdate(); }"><i class="bi-plus-lg"/> Add bookmark</button>
        <button title="Share current view" class="btn btn-outline-secondary" @click="shareCurrentView"><i class="bi-share" /> Share current view</button>
        <button title="Export to GeoJSON..." class="btn btn-outline-secondary" @click="exportBookmarks"><i class="bi-box-arrow-right" /> Export to GeoJSON</button>
        <button title="Import from GeoJSON..." class="btn btn-outline-secondary"><i class="bi-box-arrow-in-left" /> Import from GeoJSON</button>
    </div>
  </div>

  <ModalOverlay :show="showShareModal" :title="modalTitle" v-on:close="() => showShareModal = false" >
      <ShareBookmarkModal :url="shareUrl" />
  </ModalOverlay>

</template>

<style scoped>
.button-area {
    position: absolute;
    bottom: 0;
    padding: 1rem;
}

.import {
  height: 30rem;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

button {
    margin: 0.2rem;
    width: 100%;
}
</style>
