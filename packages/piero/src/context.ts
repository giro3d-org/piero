/* eslint-disable perfectionist/sort-interfaces */

import type { EventDispatcher } from 'three';

import type { AnalysisApi } from './api/analysis';
import type { BookmarkApi } from './api/bookmarks';
import type { DatasetApi } from './api/dataset';
import type { HttpApi } from './api/http';
import type { NotificationApi } from './api/notifications';
import type { SearchApi } from './api/search';
import type { ViewApi } from './api/view';
import type { WidgetApi } from './api/widgets';
import type { Configuration } from './configuration/configuration';
import type { PieroEvents } from './events';

/**
 * Piero context.
 */
export interface PieroContext {
    /**
     * The base URL of the application.
     */
    baseURL: string;

    /**
     * The configuration of the Piero app.
     */
    configuration: Readonly<Configuration>;

    /**
     * The global event dispatcher.
     */
    events: EventDispatcher<PieroEvents>;

    /**
     * APIs to perform HTTP requests.
     */
    http: HttpApi;

    /**
     * Interface to the analysis API.
     */
    analysis: AnalysisApi;

    /**
     * Bookmark related functions.
     */
    bookmarks: BookmarkApi;

    /**
     * Dataset related functions.
     */
    datasets: DatasetApi;

    /**
     * Notification related functions.
     */
    notifications: NotificationApi;

    /**
     * Search related functions.
     */
    search: SearchApi;

    /**
     * 3D View related functions.
     */
    view: ViewApi;

    /**
     * Widget API.
     */
    widgets: WidgetApi;
}
