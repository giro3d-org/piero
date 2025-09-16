import vue from '@vitejs/plugin-vue';
import child_process from 'child_process';
import fs from 'fs';
import { fileURLToPath, URL } from 'node:url';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import dts from 'vite-plugin-dts';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import pkgConfig from './package.json';

type PackageJson = {
    name: string;
    homepage?: string;
    repository?:
        | string
        | {
              url: string;
          };
};

let commitHash = 'unknown';
try {
    commitHash = child_process.execSync('git describe --tags --always').toString();
} catch {
    // Ignore
}

console.log(`📦️ Building package @giro3d/piero at ${commitHash}`);

const homepages: Record<string, string> = {
    'camera-controls': 'https://github.com/yomotsu/camera-controls',
    'openbim-components': 'https://ifcjs.github.io/components/',
    'web-ifc': 'https://ifcjs.github.io/web-ifc/docs/',
};

function getHomepage(packageJson: PackageJson): string | undefined {
    if (homepages[packageJson.name] != null) {
        return homepages[packageJson.name];
    }
    if (packageJson.homepage != null) {
        return packageJson.homepage;
    }
    if (packageJson.repository != null) {
        if (typeof packageJson.repository === 'string') {
            if (packageJson.repository.startsWith('github')) {
                return 'https://github.com/' + packageJson.repository.split(':')[1];
            } else if (packageJson.repository.startsWith('gitlab')) {
                return 'https://gitlab.com/' + packageJson.repository.split(':')[1];
            } else if (packageJson.repository.startsWith('http')) {
                return packageJson.repository;
            } else {
                return undefined;
            }
        } else {
            return packageJson.repository.url.replace('.git', '');
        }
    }
    return undefined;
}

const dependencies: Record<
    string,
    {
        description: string;
        license: string;
        homepage?: string;
    }
> = {};

for (const pkg of Object.keys(pkgConfig.dependencies)) {
    const packageFilePath = path.join(__dirname, '..', '..', 'node_modules', pkg, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageFilePath, 'utf8'));
    dependencies[packageJson.name] = {
        description: packageJson.description,
        license: packageJson.license,
        homepage: getHomepage(packageJson),
    };
}

// https://vitejs.dev/config/
const config = defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const isProduction = mode === 'production';

    const root = __dirname + '/';
    const modules = path.resolve(root, '../../node_modules');

    return {
        root,
        define: {
            'import.meta.env.VITE_DEPENDENCIES': JSON.stringify(dependencies),
            'import.meta.env.VITE_GIT_COMMIT': JSON.stringify(commitHash),
            'import.meta.env.VITE_HEADERS': env.VITE_HEADERS,
            'import.meta.env.VITE_AUTHORIZATIONS': env.VITE_AUTHORIZATIONS,
        },
        optimizeDeps: {
            // We have an issue with the cityjson-three-loader which can be resolved by not optimizing it
            // however it depends on earcut which _has_ to be optimized (because giro3d also depends on it)
            include: ['earcut'],
            exclude: ['cityjson-threejs-loader'],
        },
        build: {
            sourcemap: !isProduction,
            minify: isProduction,

            lib: {
                name: 'piero',
                entry: {
                    // To help with tree-shaking, modules are shipped in a separate entry point.
                    index: './src/index.ts',
                    modules: './src/modules/index.ts',
                },
                formats: ['es', 'cjs'],
            },

            rollupOptions: {
                external: ['vue', '@giro3d/giro3d', 'three', 'ol'],
                output: {
                    globals: {
                        vue: 'Vue',
                    },
                    assetFileNames: 'assets/[name][extname]',
                    chunkFileNames: '[name].[format].js',
                    entryFileNames: ({ name }) => {
                        // name will be "index" or "modules"
                        return `${name}.[format].js`;
                    },
                },
            },
        },
        plugins: [
            vue(),
            dts({
                insertTypesEntry: true, // generates an entrypoint .d.ts
            }),
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
                // Use our dependencies for openbim-components & stuff
                three: path.resolve(modules, 'three'),
                'web-ifc': path.resolve(modules, 'web-ifc'),
                'camera-controls': path.resolve(modules, 'camera-controls'),
                // Use our dependencies for @math.gl
                proj4: path.resolve(modules, 'proj4'),
            },
        },
    };
});

export default config;
