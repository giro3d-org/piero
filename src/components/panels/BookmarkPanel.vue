<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import Bookmarks from '../controllers/BookmarkController'
import BookmarkItem from './BookmarkItem.vue'
import ShareBookmarkModal from './ShareBookmarkModal.vue'
import EmptyIndicator from './EmptyIndicator.vue';
import ModalOverlay from '../ModalOverlay.vue';
import Bookmark from '../../types/Bookmark';
import MainController from '../controllers/MainController';

const bookmarks = shallowRef(Bookmarks.getBookmarks());
const showShareModal = ref(false);
const shareUrl = ref<string>(null);
const modalTitle = ref<string>(null);
const hiddenInput = ref<HTMLInputElement>(null);

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

async function importBookmarks(file: Blob) {
  const str = await file.text();
  const serializedBookmarks = JSON.parse(str);

  const existingBookmarks = new Set(Bookmarks.getBookmarks().map(b => b.name));

  let nbImported = 0;
  let nbSkipped = 0;

  serializedBookmarks.forEach(bookmark => {
    if (!existingBookmarks.has(bookmark.title)) {
      Bookmarks.addBookmark(Bookmark.new(bookmark.title, bookmark.url))
      nbImported++;
    } else {
      nbSkipped++;
    }
  });

  // To trigger a re-render of the bookmark list,
  // we need to assign a different reference to the bookmark array,
  // otherwise Vue does not detect the change.
  bookmarks.value = [];
  bookmarks.value = Bookmarks.getBookmarks();

  // TODO implement alerts
  // Alerts.showAlert(`${nbImported} bookmarks imported (${nbSkipped} skipped)`, 'success', true);
};

async function importBookmarkFile(e: Event) {
  for (const  file of (e.target as HTMLInputElement).files)
    importBookmarks(file);
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
        <button title="Create a new bookmark from the current view" class="btn btn-primary" @click="() => { addBookmark(); $forceUpdate(); }"><i class="bi-plus-lg"/> New bookmark</button>
        <button title="Share current view" class="btn btn-outline-secondary" @click="shareCurrentView"><i class="bi-share" /> Share view</button>
        <button title="Export bookmarks to GeoJSON" class="btn btn-outline-secondary" @click="exportBookmarks"><i class="bi-box-arrow-right" /> Export bookmarks</button>

        <!-- Import from GeoJSON -->
        <button title="Import bookmarks from GeoJSON" class="btn btn-outline-secondary" @click="hiddenInput.click()"><i class="bi-box-arrow-in-left" /> Import bookmarks</button>
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
.button-area {
    position: absolute;
    bottom: 0;
    left: 0;
    padding-left: 1rem;
    padding-right: 1rem;
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
    margin-top: 0.2rem;
    width: 100%;
}
</style>
