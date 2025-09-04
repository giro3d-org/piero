import { EventDispatcher } from 'three';
import type Bookmark from './types/Bookmark';

/**
 * An event with no argument.
 */
export type PieroEmptyEvent = unknown;

/**
 * An event with a payload.
 */
export type PayloadEvent<T> = { value: T };

export interface PieroGlobalEvents {
    /**
     * Raised when the application has finished loading.
     */
    ready: PieroEmptyEvent;
}

export interface BookmarkEvents {
    'bookmark-added': PayloadEvent<Bookmark>;
    'bookmark-removed': PayloadEvent<Bookmark>;
}

export type PieroEvents = PieroGlobalEvents & BookmarkEvents;

export const GLOBAL_EVENT_DISPATCHER = new EventDispatcher<PieroEvents>();
