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
     * The base URL of the application.
     */
    baseURL: URL;

    /**
     * Bookmark related functions.
     */
    bookmarks: BookmarkApi;

    /**
     * The configuration of the Piero app.
     */
    configuration: Readonly<Configuration>;

    /**
     * Dataset related functions.
     */
    datasets: DatasetApi;

    /**
     * The global event dispatcher.
     */
    events: EventDispatcher<PieroEvents>;

    /**
     * 3D View related functions.
     */
    view: ViewApi;
}
