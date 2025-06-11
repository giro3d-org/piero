import vue from '@vitejs/plugin-vue';
import child_process from 'child_process';
import fs from 'fs';
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
    const packageFilePath = path.join(__dirname, 'node_modules', pkg, 'package.json');
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
            sourcemap: true,
            minify: false,

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
                    manualChunks: function manualChunks(id) {
                        if (id.includes('node_modules')) {
                            return 'vendor';
                        }

                        return null;
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
                // Use our dependencies for openbim-components & stuff
                three: path.resolve('./node_modules/three'),
                'web-ifc': path.resolve('./node_modules/web-ifc'),
                'camera-controls': path.resolve('./node_modules/camera-controls'),
                // Use our dependencies for @math.gl
                proj4: path.resolve('./node_modules/proj4'),
            },
        },
    };
});

export default config;
