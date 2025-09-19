import type { BookmarkStore } from '@/stores/bookmarks';
import type Bookmark from '@/types/Bookmark';

/** @internal */
export class BookmarkApiImpl implements BookmarkApi {
    private readonly _store: BookmarkStore;

    public constructor(store: BookmarkStore) {
        this._store = store;
    }

    public clearBookmarks(): void {
        this._store.clear();
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
}

export default interface BookmarkApi {
    clearBookmarks(): void;
    getBookmarks(): Bookmark[];
    setBookmarks(bookmarks: Bookmark[]): void;
}
