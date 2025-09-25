import { createPinia } from 'pinia';
import { createApp } from 'vue';

import type { PieroContext } from './context';
import type { Module } from './module';
import type { Configuration } from './types/Configuration';

import './assets/main.scss';
import type { DynamicStyleCollection } from './types/VectorStyle';

import { AnalysisApiImpl } from './api/AnalysisApi';
import { BookmarkApiImpl } from './api/BookmarkApi';
import { DatasetApiImpl } from './api/DatasetApi';
import App from './App.vue';
import { loadRemoteConfiguration, setConfiguration, setDynamicStyles } from './config-loader';
import { GLOBAL_EVENT_DISPATCHER } from './events';
import { useAnalysisStore } from './stores/analysis';
import { useBookmarkStore } from './stores/bookmarks';
import { useDatasetStore } from './stores/datasets';
import { useModuleStore } from './stores/modules';
import Download from './utils/Download';

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

export type AppParameters = {
    /**
     * The base URL of the application. This is used to resolve relative URLs.
     * @example 'http://localhost:8080/' or 'https://mydomain.com/myapp/'
     */
    baseUrl: string;
    /**
     * The static configuration to use, or the URL to a remote configuration.
     */
    configuration: Configuration | string;
    /**
     * Where to attach the piero root element.
     */
    container: Element | string;

    /**
     * Optional style functions to use.
     */
    dynamicStyles?: DynamicStyleCollection;

    /**
     * The list of modules to load.
     * @defaultValue []
     */
    modules?: Module[];
};

/**
 * Entry point for a Piero application.
 */
export default async function createPieroApp(params: AppParameters): Promise<void> {
    const configuration = await resolveConfiguration(params);
    await setConfiguration(configuration);

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

    const analysisStore = useAnalysisStore(pinia);

    // Here we create a context that will be used by modules
    // to interact with the Piero application, without having
    // to import individual services.
    const context: Partial<PieroContext> = {
        analysis: new AnalysisApiImpl(analysisStore),
        baseURL: new URL(Download.getBaseUrl()),
        bookmarks: new BookmarkApiImpl(useBookmarkStore(pinia)),
        configuration,
        datasets: new DatasetApiImpl(useDatasetStore(pinia)),
        events: GLOBAL_EVENT_DISPATCHER,
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
