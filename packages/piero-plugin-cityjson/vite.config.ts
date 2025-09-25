import { nodeResolve } from '@rollup/plugin-node-resolve';
import child_process from 'child_process';
import { fileURLToPath, URL } from 'node:url';
import path from 'path';
import { nodeExternals } from 'rollup-plugin-node-externals';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import inlineWorker from '../../build/vite-plugin-inline-worker';

let commitHash = 'unknown';
try {
    commitHash = child_process
        .execSync('git describe --tags --match "packages-v*" --always')
        .toString();
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
                output: {
                    entryFileNames: ({ name }): string => {
                        return `${name}.[format].js`;
                    },
                },
                preserveSymlinks: true,
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
            nodeExternals({
                // We bundle the cityjson library directly since it makes uses of workers.
                exclude: ['cityjson-threejs-loader'],
            }),
            nodeResolve(),
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
