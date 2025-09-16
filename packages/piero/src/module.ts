import type { PieroContext } from './context';

export interface Module {
    /**
     * The readable name of the module.
     */
    name: string;
    /**
     * Initialize this module on the Piero context.
     */
    initialize(context: PieroContext): Promise<void> | void;
}
