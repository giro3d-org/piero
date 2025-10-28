import { nodeResolve } from '@rollup/plugin-node-resolve';
import child_process from 'child_process';
import { fileURLToPath, URL } from 'node:url';
import { nodeExternals } from 'rollup-plugin-node-externals';
import { defineConfig, mergeConfig } from 'vite';

import { commonConfig } from './packages/piero/vite.config';

let commitHash = 'unknown';
try {
    commitHash = child_process.execSync('git describe --tags --match "app-v*" --always').toString();
} catch {
    // Ignore
}

// https://vitejs.dev/config/
const appConfig = defineConfig(() => {
    console.log(`🚀 Building Piero app at ${commitHash}`);

    const root = __dirname + '/';

    return {
        // Use a relative base so that the application is portable
        // (it can be deployed from anywhere). This is especially
        // useful when deploying from the docker image.
        base: './',

        build: {
            lib: false,

            rollupOptions: {
                output: {
                    // Chunkin serves two purposes:
                    // 1. At build time, reduce the amount of memory required, since by default Rollup
                    //    will attempt to generate a single, huge chunk, which will require a lot of memory.
                    // 2. At runtime, split the total data to download into manageable chunks so that browser
                    //    can load them in parallel.
                    //
                    // However, chunking has its own drawbacks, such as subtly changing the behaviour of the application
                    // and even break at runtime. The rollup doc says:
                    // "Be aware that manual chunks can change the behaviour of the application if side
                    // effects are triggered before the corresponding modules are actually used."
                    // https://rollupjs.org/configuration-options/#output-manualchunks
                    //
                    // So we have to find the right chunking method to avoid those runtime issues.
                    // But since the dependencies change with versions, we have to re-test and update
                    // the chunking strategy.
                    manualChunks: function manualChunks(id): string | null {
                        if (id.includes('node_modules')) {
                            return 'vendor';
                        }

                        return null;
                    },
                },
            },
        },
        optimizeDeps: {
            // We have an issue with the cityjson-three-loader with Workers when optimized
            // (see https://gitlab.com/giro3d/piero/-/issues/98)
            // however it depends on earcut which _has_ to be optimized (because giro3d also depends on it)
            exclude: ['cityjson-threejs-loader'],
            include: ['earcut'],
        },
        plugins: [nodeExternals(), nodeResolve()],
        resolve: {
            alias: {
                '@giro3d/piero': fileURLToPath(new URL('./packages/piero/src', import.meta.url)),
                '@giro3d/piero-plugin-cityjson': fileURLToPath(
                    new URL('./packages/piero-plugin-cityjson/src', import.meta.url),
                ),
            },
        },
        root,
    };
});

export default defineConfig(env => mergeConfig(commonConfig(env), appConfig(env)));
