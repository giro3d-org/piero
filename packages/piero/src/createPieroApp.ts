import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import { BookmarkApiImpl } from './api/BookmarkApi';
import { DatasetApiImpl } from './api/DatasetApi';
import './assets/main.scss';
import { loadRemoteConfiguration, setConfiguration, setDynamicStyles } from './config-loader';
import type { PieroContext } from './context';
import { GLOBAL_EVENT_DISPATCHER } from './events';
import type { Module } from './module';
import { useBookmarkStore } from './stores/bookmarks';
import { useModuleStore } from './stores/modules';
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

    /**
     * The base URL of the application. This is used to resolve relative URLs.
     * @example 'http://localhost:8080/' or 'https://mydomain.com/myapp/'
     */
    baseUrl: string;

    /**
     * The list of modules to load.
     * @defaultValue []
     */
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

    // We define the Pinia store in advance because we will have
    // to inject it into APIs.
    const pinia = createPinia();

    const moduleStore = useModuleStore(pinia);
    moduleStore.setLoadedModules(params.modules ?? []);

    // Here we create a context that will be used by modules
    // to interact with the Piero application, without having
    // to import individual services.
    const context: Partial<PieroContext> = {
        configuration,
        baseURL: new URL(Download.getBaseUrl()),
        events: GLOBAL_EVENT_DISPATCHER,
        bookmarks: new BookmarkApiImpl(useBookmarkStore(pinia)),
        datasets: new DatasetApiImpl(),
    };

    const readyContext = context as PieroContext;

    const moduleInitializations: Promise<void>[] = [];

    // Now we can register the modules.
    if (params.modules) {
        for (const module of params.modules) {
            const init = Promise.resolve(module.initialize(readyContext));
            moduleInitializations.push(init);
            console.info(`Module ${module.name} initialized.`);
        }
    }

    await Promise.all(moduleInitializations);

    // Mount the Piero root component in the provided element.
    const app = createApp(App, { getContext: () => context });
    app.use(pinia);
    app.mount(params.container);
}
