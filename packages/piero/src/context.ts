import type { EventDispatcher } from 'three';

import type BookmarkApi from './api/BookmarkApi';
import type DatasetApi from './api/DatasetApi';
import type ViewApi from './api/ViewApi';
import type { PieroEvents } from './events';
import type { Configuration } from './types/Configuration';

/**
 * Piero context.
 */
export interface PieroContext {
    /**
     * The configuration of the Piero app.
     */
    configuration: Readonly<Configuration>;

    /**
     * The global event dispatcher.
     */
    events: EventDispatcher<PieroEvents>;

    /**
     * The base URL of the application.
     */
    baseURL: URL;

    /**
     * Dataset related functions.
     */
    datasets: DatasetApi;

    /**
     * 3D View related functions.
     */
    view: ViewApi;

    /**
     * Bookmark related functions.
     */
    bookmarks: BookmarkApi;
}
