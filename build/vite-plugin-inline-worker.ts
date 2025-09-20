import type { PluginContext } from 'rollup';
import type { Plugin } from 'vite';

import * as path from 'node:path';

const regexEsm = /new Worker\(\s*(new URL\(\s[^\)]+\))[^\)]*\)/g;
const regexCjs = /new Worker\(\s*.*{\s*type:\s*"module"\s*}\s*\)/g;
const workerUrl = /\/assets\/.*?\.js/g;

async function inlineWorkers(
    context: PluginContext,
    outDir: string,
    code: string,
): Promise<string> {
    const matches = [...code.matchAll(regexEsm), ...code.matchAll(regexCjs)];

    let inlinedCode = code;

    if (matches.length > 0) {
        for (const match of matches) {
            const url = match[0].match(workerUrl);

            if (url == null) {
                context.error('could not parse worker path');
            } else {
                context.info(`inlining worker: ${url[0]}`);

                const workerFilePath = path.join(outDir, url[0]);
                const workerCode = await context.fs.readFile(workerFilePath, { encoding: 'utf8' });
                const base64 = btoa(workerCode);

                const dataUrl = `new Blob([atob('${base64}')], {type: "text/javascript"})`;
                const replacementValue = `new Worker(URL.createObjectURL(${dataUrl}))`;
                inlinedCode = inlinedCode.replace(match[0], replacementValue);
            }
        }
    }

    return inlinedCode;
}

export default function plugin(): Plugin {
    return {
        name: 'vite-plugin-inline-worker',

        writeBundle: {
            handler: async function (_, bundle): Promise<void> {
                const root = this.environment.config.root;
                const outDir = this.environment.config.build.outDir;
                const absOutDir = path.join(root, outDir);

                for (const fileName of Object.keys(bundle)) {
                    const entry = bundle[fileName];

                    if (entry.type === 'chunk' && entry.code.includes('new Worker')) {
                        const chunkPath = path.join(absOutDir, fileName);
                        this.info(`processing chunk: ${entry.fileName}`);
                        const inlinedCode = await inlineWorkers(this, absOutDir, entry.code);
                        await this.fs.writeFile(chunkPath, inlinedCode);
                    }
                }
            },
            order: 'post',
        },
    };
}
