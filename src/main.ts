import './assets/main.scss';

import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import { loadConfig } from './config-loader';

async function start(): Promise<void> {
    await loadConfig();

    const app = createApp(App);
    app.use(createPinia());
    app.mount('#app');
}

start();
