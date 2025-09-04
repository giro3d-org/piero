import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import './assets/main.scss';
import { loadRemoteConfiguration, setConfiguration, setDynamicStyles } from './config-loader';
import type { PieroContext } from './context';
import { GLOBAL_EVENT_DISPATCHER } from './events';
import { registerLoader } from './loaders/loader';
import type { Module } from './module';
import type { Configuration } from './types/Configuration';
import type { DynamicStyleCollection } from './types/VectorStyle';
import Download from './utils/Download';

export type AppParameters = {
    /**
     * Where to attach the piero root element.
     */
    container: string | Element;
    /**
     * The static configuration to use, or the URL to a remote configuration.
     */
    configuration: Configuration | string;
    /**
     * Optional style functions to use.
     */
    dynamicStyles?: DynamicStyleCollection;

    baseUrl: string;

    modules?: Module[];
};

async function resolveConfiguration(params: AppParameters): Promise<Configuration> {
    let configuration: Configuration;

    if (typeof params.configuration === 'string') {
        console.info(`Loading remote configuration from: ${params.configuration}`);
        const remoteConfiguration = await loadRemoteConfiguration(params.configuration);
        console.info('Remote configuration successfuly loaded.');
        configuration = remoteConfiguration;
    } else {
        configuration = params.configuration;
    }

    return configuration;
}

/**
 * Entry point for a Piero application.
 */
export default async function createPieroApp(params: AppParameters): Promise<void> {
    const configuration = await resolveConfiguration(params);
    setConfiguration(configuration);

    console.info('Configuration loaded.');

    if (params.dynamicStyles) {
        setDynamicStyles(params.dynamicStyles);
    }

    Download.setBaseUrl(params.baseUrl);

    // Here we create a context that will be used by modules to interact
    // with the Piero application, without having to import
    // individual services.
    const context: Partial<PieroContext> = {
        configuration,
        registerLoader,
        events: GLOBAL_EVENT_DISPATCHER,
    };

    // Mount the Piero root component in the provided element.
    const app = createApp(App, { getContext: () => context });
    app.use(createPinia());
    app.mount(params.container);

    const readyContext = context as PieroContext;

    // Now we can register the modules.
    if (params.modules) {
        for (const module of params.modules) {
            module.initialize(readyContext);
            console.info(`Module ${module.name} registered.`);
        }
    }
}
