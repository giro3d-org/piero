import { nodeResolve } from '@rollup/plugin-node-resolve';
import child_process from 'child_process';
import { fileURLToPath, URL } from 'node:url';
import { nodeExternals } from 'rollup-plugin-node-externals';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

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
        plugins: [
            nodeExternals(),
            nodeResolve(),
            dts({
                insertTypesEntry: true, // generates an entrypoint .d.ts
            }),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        root,
    };
});

export default config;
