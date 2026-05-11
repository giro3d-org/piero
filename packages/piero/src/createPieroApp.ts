import { createPinia } from 'pinia';
import { createApp } from 'vue';

import type { Configuration } from '@/configuration/configuration';
import type { PieroContext } from '@/context';
import type { ModuleConstructor } from '@/module';
import type { PieroApplication } from '@/PieroApplication';

import { AnalysisApiImpl } from '@/api/analysis';
import { BookmarkApiImpl } from '@/api/bookmarks';
import { DatasetApiImpl } from '@/api/dataset';
import { HttpApiImpl } from '@/api/http';
import { NotificationApiImpl } from '@/api/notifications';
import { SearchApiImpl } from '@/api/search';
import { WidgetApiImpl } from '@/api/widgets';
import App from '@/App.vue';
import defaultConfig from '@/configuration/defaultConfig';
import { loadRemoteConfiguration, setConfiguration } from '@/configurationLoader';
import { GLOBAL_EVENT_DISPATCHER } from '@/events';
import { useAnalysisStore } from '@/stores/analysis';
import { useBookmarkStore } from '@/stores/bookmarks';
import { useDatasetStore } from '@/stores/datasets';
import { useModuleStore } from '@/stores/modules';
import { useNotificationStore } from '@/stores/notifications';
import { useSearchStore } from '@/stores/search';
import { useWidgetStore } from '@/stores/widgets';
import Download from '@/utils/Download';
import '@/assets/main.scss';

async function resolveConfiguration(params: {
    configuration?: Configuration | string;
}): Promise<Configuration> {
    let configuration: Configuration;

    if (params.configuration == null) {
        // Return the minimal default config
        return defaultConfig;
    }

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
 * @returns A promise that resolves when the application has been initialized and is ready to use.
 */
export default async function createPieroApp(params: {
    /**
     * The base URL of the application. This is used to resolve relative URLs.
     * @example 'http://localhost:8080/' or 'https://mydomain.com/myapp/'
     * @defaultValue './'
     */
    baseUrl?: string;

    /**
     * The static configuration to use, or the URL to a remote configuration.
     * If no configuration is specified, the default configuration will be used.
     */
    configuration?: Configuration | string;
    /**
     * Where to attach the piero root DOM element. Can be either the `id` of an existing element, or a reference to a DOM element.
     */
    container: Element | string;

    /**
     * The list of modules to load.
     * @defaultValue []
     */
    modules?: ModuleConstructor[];
}): Promise<PieroApplication> {
    // We need to set baseUrl first, before potentially resolving remote relative configurations
    Download.setBaseUrl(params.baseUrl ?? './');

    const configuration = await resolveConfiguration(params);
    await setConfiguration(configuration);

    console.info('Configuration loaded.');

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
    const context: Omit<PieroContext, 'view'> = {
        analysis: new AnalysisApiImpl(analysisStore),
        baseURL: Download.getBaseUrl(),
        bookmarks: new BookmarkApiImpl(useBookmarkStore(pinia)),
        configuration,
        datasets: new DatasetApiImpl(useDatasetStore(pinia)),
        events: GLOBAL_EVENT_DISPATCHER,
        http: new HttpApiImpl(),
        notifications: new NotificationApiImpl(useNotificationStore(pinia)),
        search: new SearchApiImpl(useSearchStore(pinia)),
        widgets: new WidgetApiImpl(useWidgetStore(pinia)),
    };

    // @ts-expect-error TODO we have to initialize a
    // partial context because we can't yet create
    // the view entry since it requires a Giro3D instance;
    const readyContext: PieroContext = context;

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
