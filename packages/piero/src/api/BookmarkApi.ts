import type { BookmarkStore } from '@/stores/bookmarks';
import type Bookmark from '@/types/Bookmark';

export default interface BookmarkApi {
    getBookmarks(): Bookmark[];
    setBookmarks(bookmarks: Bookmark[]): void;
    clearBookmarks(): void;
}

/** @internal */
export class BookmarkApiImpl implements BookmarkApi {
    private readonly _store: BookmarkStore;

    constructor(store: BookmarkStore) {
        this._store = store;
    }

    getBookmarks(): Bookmark[] {
        return this._store.getBookmarks();
    }

    setBookmarks(bookmarks: Bookmark[]): void {
        this._store.clear();
        for (const bookmark of bookmarks) {
            this._store.add(bookmark);
        }
    }

    clearBookmarks(): void {
        this._store.clear();
    }
}
