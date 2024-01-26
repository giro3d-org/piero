import { fileURLToPath, URL } from 'node:url'
import path from 'path';

import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import vue from '@vitejs/plugin-vue'

const openbimComponentsChunks = {
    // Big libs, put them in their own chunks
    'web-ifc': 'web-ifc',
};

// https://vitejs.dev/config/
export default defineConfig({
    optimizeDeps: {
        // We have an issue with the cityjson-three-loader which can be resolved by not optimizing it
        // however it depends on earcut which _has_ to be optimized (because giro3d also depends on it)
        include: ['earcut'],
        exclude: ['cityjson-threejs-loader']
    },
    build: {
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: function manualChunks(id) {
                    // By default, Vite/Rollup tries to generate one big chunk with mostly everything.
                    // It takes a lot of memory to do so (breaks when building on small VMs, e.g. 4GB of RAM), and produces a huge chunk.
                    // Here we generate one chunk:
                    // - per node_module (except for openbim-components which is splitted)
                    // - for the app itself
                    // This ends up generating _a lot_ of chunks (>120), but each are quite small.
                    // We could try to regroup some of them into larger chunks, but:
                    // - having that many chunks is not that bad when using HTTP2,
                    // - we'd need to carefully craft the chunks to check their size and avoid bundling errors like
                    //   "ReferenceError: can't access lexical declaration 'ma' before initialization"
                    // - we also have a production build that is closer to the development build

                    if (id.includes('node_modules')) {
                        const paths = id.split('/'); // TODO: check on windows - might not work?
                        const i = paths.indexOf('node_modules');
                        const npm_module = paths.at(i + 1);

                        if (npm_module === 'openbim-components') {
                            // Very large (3,806.30 kB │ gzip: 649.38 kB) and includes the whole universe, including three AGAIN
                            // So chunk it
                            const openbim_path = paths.at(i + 2);
                            if (openbim_path === 'node_modules') {
                                // And go a step further...
                                const openbim_modules_path = paths.at(i + 3);
                                if (openbim_modules_path in openbimComponentsChunks) return `${npm_module}-${openbimComponentsChunks[openbim_modules_path]}`;
                            }
                            return npm_module;
                        }

                        return npm_module;
                    } else if (id.includes('/src/')) {
                        return 'app';
                    }
                },
            },
        },
    },
    plugins: [
        vue(),
        nodePolyfills({
            // Whether to polyfill specific globals.
            globals: {
                Buffer: true, // can also be 'build', 'dev', or false
                global: true,
                process: true,
            },
            // Whether to polyfill `node:` protocol imports.
            protocolImports: true,
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            three: path.resolve('./node_modules/three'),
            'camera-controls': path.resolve('./node_modules/camera-controls'),
        }
    }
})
