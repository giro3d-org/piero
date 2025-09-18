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

    public constructor(store: BookmarkStore) {
        this._store = store;
    }

    public getBookmarks(): Bookmark[] {
        return this._store.getBookmarks();
    }

    public setBookmarks(bookmarks: Bookmark[]): void {
        this._store.clear();
        for (const bookmark of bookmarks) {
            this._store.add(bookmark);
        }
    }

    public clearBookmarks(): void {
        this._store.clear();
    }
}
