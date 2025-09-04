import type { EventDispatcher } from 'three';
import type { PieroEvents } from './events';
import type { LoadDatasetFromFile } from './loaders/loader';
import type Giro3DManager from './services/Giro3DManager';
import type { Configuration } from './types/Configuration';

/**
 * Piero context.
 */
export interface PieroContext {
    /**
     * The configuration of the Piero app.
     */
    configuration: Readonly<Configuration>;

    events: EventDispatcher<PieroEvents>;

    /**
     * Registers a file loader on the given extension. If a loader with the same
     * extension already exists, it is replaced by the new one.
     * @param fileExtension - The file extension (without the dot)
     * @param loader - The loader to use on this extension.
     */
    registerLoader(fileExtension: string, loader: LoadDatasetFromFile): void;

    giro3dManager: Giro3DManager;
}
