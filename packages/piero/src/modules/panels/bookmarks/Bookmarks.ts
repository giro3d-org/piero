import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import BookmarkPanel from './BookmarkPanel.vue';

export default class Bookmarks implements Module {
    public readonly id = 'builtin-panel-bookmarks';
    public readonly name = 'Bookmarks panel';

    public initialize(context: PieroContext): Promise<void> | void {
        context.panels.register({
            component: BookmarkPanel,
            icon: 'bi-bookmarks',
            id: 'bookmarks',
            title: 'Bookmarks',
        });
    }
}
