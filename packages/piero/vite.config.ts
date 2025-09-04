import vue from '@vitejs/plugin-vue';
import child_process from 'child_process';
import fs from 'fs';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
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

console.log(`📦️ Building Piero at ${commitHash}`);

const homepages = {
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

const dependencies = {};
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

    return {
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
            outDir: resolve(__dirname, 'dist'),

            lib: {
                name: 'piero',
                entry: {
                    index: resolve(__dirname, 'src/index.ts'),
                    modules: resolve(__dirname, 'src/modules/index.ts'),
                },
            },

            rollupOptions: {
                external: ['vue'],

                output: {
                    assetFileNames: 'assets/[name][extname]',
                    entryFileNames: '[name].js',
                    globals: {
                        vue: 'Vue',
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
                // // Use our dependencies for openbim-components & stuff
                // three: path.resolve('./node_modules/three'),
                // 'web-ifc': path.resolve('./node_modules/web-ifc'),
                // 'camera-controls': path.resolve('./node_modules/camera-controls'),
                // // Use our dependencies for @math.gl
                // proj4: path.resolve('./node_modules/proj4'),
            },
        },
    };
});

export default config;
