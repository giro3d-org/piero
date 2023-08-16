<script setup>
import Bookmarks from '../controllers/BookmarkController'
import BookmarkItem from './BookmarkItem.vue'

const bookmarks = Bookmarks.getBookmarks()

</script>

<template>
  <div>
    <ul class="layers-list-group">
      <BookmarkItem
        v-for="bookmark in bookmarks"
        :key="bookmark.name"
        :url="bookmark.url"
        :name="bookmark.name"
        v-on:share="() => { /* TODO */ ; $forceUpdate() }"
        v-on:delete="() => { Bookmarks.deleteBookmark(bookmark); $forceUpdate() }"
      />
    </ul>


    <div class="button-area">
        <hr>
        <button title="New bookmark..." class="btn btn-primary"><i class="bi-plus-lg" /> Add bookmark</button>
        <button title="Share current view" class="btn btn-outline-secondary"><i class="bi-share" /> Share current view</button>
        <button title="Export to GeoJSON..." class="btn btn-outline-secondary"><i class="bi-box-arrow-right" /> Export to GeoJSON</button>
        <button title="Import from GeoJSON..." class="btn btn-outline-secondary"><i class="bi-box-arrow-in-left" /> Import from GeoJSON</button>
    </div>
  </div>
</template>

<style scoped>
.button-area {
    position: absolute;
    bottom: 0;
    padding: 1rem;
}

button {
    margin: 0.2rem;
    width: 100%;
}
</style>
