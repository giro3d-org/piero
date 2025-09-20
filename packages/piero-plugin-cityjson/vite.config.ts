import child_process from 'child_process';
import { fileURLToPath, URL } from 'node:url';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import inlineWorker from '../../build/vite-plugin-inline-worker';

let commitHash = 'unknown';
try {
    commitHash = child_process.execSync('git describe --tags --always').toString();
} catch {
    // Ignore
}

const config = defineConfig(e => {
    console.log(`📦️ Building package @giro3d/piero-plugin-cityjson at ${commitHash}`);

    const mode = e.mode;
    const isProduction = mode === 'production';
    const root = __dirname + '/';
    const modules = path.resolve(root, '../../node_modules');

    return {
        build: {
            lib: {
                entry: './src/index.ts',
                formats: ['es', 'cjs'],
                name: 'piero-plugin-cityjson',
            },
            minify: isProduction ? 'esbuild' : false,

            rollupOptions: {
                external: (id): boolean => {
                    // We bundle the cityjson library directly since it makes uses of workers.
                    if (id.includes('cityjson-threejs-loader')) {
                        return false;
                    }

                    if (id.includes('packages/piero/dist')) {
                        return true;
                    }

                    return id.includes('node_modules');
                },
                output: {
                    entryFileNames: ({ name }): string => {
                        return `${name}.[format].js`;
                    },
                },
            },

            sourcemap: isProduction,
        },
        optimizeDeps: {
            // We have an issue with the cityjson-three-loader which can be resolved by not optimizing it
            // however it depends on earcut which _has_ to be optimized (because giro3d also depends on it)
            exclude: ['cityjson-threejs-loader'],
            include: ['earcut'],
        },
        plugins: [
            inlineWorker(),
            dts({
                insertTypesEntry: true, // generates an entrypoint .d.ts
            }),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                // Use our dependencies for openbim-components & stuff
                three: path.resolve(modules, 'three'),
                // Use our dependencies for @math.gl
                proj4: path.resolve(modules, 'proj4'),
            },
        },
        root,
    };
});

export default config;
