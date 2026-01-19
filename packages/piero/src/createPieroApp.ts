import { createPinia } from 'pinia';
import { createApp } from 'vue';

import type { PieroContext } from './context';
import type { ModuleConstructor } from './module';

import './assets/main.scss';
import type { PieroApplication } from './PieroApplication';
import type { Configuration } from './types/configuration/Configuration';

import { AnalysisApiImpl } from './api/AnalysisApi';
import { BookmarkApiImpl } from './api/BookmarkApi';
import { DatasetApiImpl } from './api/DatasetApi';
import { NotificationApiImpl } from './api/NotificationApi';
import { SearchApiImpl } from './api/SearchApi';
import { WidgetApiImpl } from './api/WidgetApi';
import App from './App.vue';
import { loadRemoteConfiguration, setConfiguration } from './configurationLoader';
import { GLOBAL_EVENT_DISPATCHER } from './events';
import { useAnalysisStore } from './stores/analysis';
import { useBookmarkStore } from './stores/bookmarks';
import { useDatasetStore } from './stores/datasets';
import { useModuleStore } from './stores/modules';
import { useNotificationStore } from './stores/notifications';
import { useSearchStore } from './stores/search';
import { useWidgetStore } from './stores/widgets';
import Download from './utils/Download';

async function resolveConfiguration(params: CreatePieroAppParameters): Promise<Configuration> {
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
 * The Piero configuration, or an URL pointing to a remote JSON configuration file.
 * @preventExpand
 */
export type ConfigurationOrUrl = Configuration | string;

/**
 * @expand
 */
export interface CreatePieroAppParameters {
    /**
     * The base URL of the application. This is used to resolve relative URLs.
     * @example 'http://localhost:8080/' or 'https://mydomain.com/myapp/'
     */
    baseUrl: string;
    /**
     * The static configuration to use, or the URL to a remote configuration.
     */
    configuration: ConfigurationOrUrl;
    /**
     * Where to attach the piero root element. Can be either the `id` of an existing element, or a reference to a DOM element.
     */
    container: Element | string;
    /**
     * The list of modules to load.
     * @defaultValue []
     */
    modules?: ModuleConstructor[];
}

/**
 * The Piero configuration, or an URL pointing to a remote JSON configuration file.
 */
export type ConfigurationOrUrl = Configuration | string;

/**
 * Entry point for a Piero application.
 * @returns A promise that resolves when the application has been initialized and is ready to use.
 */
export default async function createPieroApp(
    params: CreatePieroAppParameters,
): Promise<PieroApplication> {
    const configuration = await resolveConfiguration(params);
    await setConfiguration(configuration);

    console.info('Configuration loaded.');

    Download.setBaseUrl(params.baseUrl);

    // We define the Pinia store in advance because we will have
    // to inject it into APIs.
    const pinia = createPinia();

    const moduleStore = useModuleStore(pinia);
    const modules = params.modules?.map(ctor => new ctor()) ?? [];
    moduleStore.setLoadedModules(modules);

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
        notifications: new NotificationApiImpl(useNotificationStore(pinia)),
        search: new SearchApiImpl(useSearchStore(pinia)),
        widgets: new WidgetApiImpl(useWidgetStore(pinia)),
    };

    const readyContext = context as PieroContext;

    const moduleInitializations: Promise<void>[] = [];

    // Now we can register the modules.
    if (params.modules != null) {
        for (const module of modules) {
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

    return {
        context: readyContext,
    };
}
