import { EventDispatcher } from 'three';

import type Bookmark from './types/Bookmark';
import type { DatasetOrGroup } from './types/Dataset';

export interface BookmarkEvents {
    'bookmark-added': PayloadEvent<Bookmark>;
    'bookmark-removed': PayloadEvent<Bookmark>;
}

export interface DatasetEvents {
    'dataset-added': PayloadEvent<DatasetOrGroup>;
    'dataset-removed': PayloadEvent<DatasetOrGroup>;
    'dataset-visibility-changed': PayloadEvent<DatasetOrGroup>;
}

/**
 * An event with a payload.
 */
export type PayloadEvent<T> = { value: T };

/**
 * An event with no argument.
 */
export type PieroEmptyEvent = unknown;

export type PieroEvents = BookmarkEvents & DatasetEvents & PieroGlobalEvents;

export interface PieroGlobalEvents {
    /**
     * Raised when the application has finished loading.
     */
    ready: PieroEmptyEvent;
}

export const GLOBAL_EVENT_DISPATCHER = new EventDispatcher<PieroEvents>();
