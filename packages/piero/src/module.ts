import type { PieroContext } from './context';

export interface Module {
    /**
     * The unique ID of the module.
     */
    id: string;
    /**
     * The readable name of the module.
     */
    name: string;
    /**
     * Initialize this module on the Piero context.
     */
    initialize(context: PieroContext): Promise<void> | void;
}
