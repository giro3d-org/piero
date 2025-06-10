import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

const config = defineConfig(env =>
    mergeConfig(
        viteConfig(env),
        defineConfig({
            test: {
                environment: 'jsdom',
                exclude: [...configDefaults.exclude, 'e2e/*'],
                root: fileURLToPath(new URL('./', import.meta.url)),
                // testTransformMode: {
                //     web: [/\.[jt]sx$/],
                // },
            },
        }),
    ),
);

export default config;
