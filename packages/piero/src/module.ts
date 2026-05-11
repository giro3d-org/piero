import type { PieroContext } from './context';

export interface Module {
    /**
     * The unique id of the module, that also acts as a key
     * to find the module configuration in the app configuration.
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

export interface ModuleConstructor {
    new (): Module;
}
