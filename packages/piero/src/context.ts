import type { EventDispatcher } from 'three';

import type AnalysisApi from './api/AnalysisApi';
import type BookmarkApi from './api/BookmarkApi';
import type DatasetApi from './api/DatasetApi';
import type NotificationApi from './api/NotificationApi';
import type ViewApi from './api/ViewApi';
import type { PieroEvents } from './events';
import type { Configuration } from './types/Configuration';

/**
 * Piero context.
 */
export interface PieroContext {
    analysis: AnalysisApi;

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
     * Notification related functions.
     */
    notifications: NotificationApi;

    /**
     * 3D View related functions.
     */
    view: ViewApi;
}
