import { createPinia } from 'pinia';
import { createApp } from 'vue';

import EntityPanel from '@giro3d/giro3d/gui/EntityPanel';

import './assets/main.scss';

import App from './App.vue';
import { registerLoader } from './loaders/loader';
import { registerEntityBuilder } from './giro3d/EntityBuilder';
import { loadConfig } from './config-loader';

import { buildEntity } from '../../app/lithojson/LithoJSONEntity';
import LithoJSONEntityInspector from '../../app/lithojson/LithoJSONEntityInspector';
import { importFromFile } from '../../app/lithojson/importer';

async function start(): Promise<void> {
  // @ts-expect-error typing issue
  EntityPanel.registerInspector('LithoJSONEntity', LithoJSONEntityInspector);

  // @ts-expect-error typing issue
  registerLoader('litho.json', importFromFile);
  registerEntityBuilder('lithojson', buildEntity);

  await loadConfig();

  const app = createApp(App);
  app.use(createPinia());
  app.mount('#app');
}

start().catch(console.error);