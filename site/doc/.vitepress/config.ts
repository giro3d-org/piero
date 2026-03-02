import type { DefaultTheme } from 'vitepress';

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vitepress';
import chokidar from 'chokidar';
import { endsWith } from 'zod';

const projectRoot = path.join(__dirname, '../../../');
const moduleDocOutputDir = path.join(__dirname, '../module-reference');
const moduleTemplate = fs.readFileSync(path.join(__dirname, 'module-doc-template.md'), 'utf-8');

function collectModuleDocumentationFiles(): DefaultTheme.SidebarItem[] {
    const packageRoot = path.join(projectRoot, 'packages');

    return fs
        .readdirSync(packageRoot, { encoding: 'utf-8', recursive: true, withFileTypes: true })
        .filter(isModuleDocumentationFile)
        .map(generateModuleDocumentation);
}

function formatModuleImport(
    isBuiltin: boolean,
    parentPath: string,
    packageName: string,
    moduleName: string,
): string {
    const importPath = isBuiltin ? '@giro3d/piero/modules' : `${packageName}`;
    const importedModule = isBuiltin ? parentPath.split('/').pop() : moduleName;
    const moduleEntry = isBuiltin
        ? `${parentPath.split('/').pop()}.${moduleName}`
        : `${moduleName}`;

    return `\`\`\`js
import { ${importedModule} } from '${importPath}';

createPieroApp({
    ...
    modules: [
        ${moduleEntry}
        ...
    ]
})
\`\`\``;
}

function generateModulePage(moduleName: string, absPath: string, outputFilename: string, parentPath: string) {
    const { content, data } = matter(fs.readFileSync(absPath, 'utf-8'));

    const isBuiltin = data.type === 'builtin';
    const packageName = isBuiltin ? '@giro3d/piero' : data.package;

    const packageBadge = `<Badge type="${isBuiltin ? 'info' : 'warning'}" text="${packageName}" />`;

    const preamble = isBuiltin
        ? ''
        : `
> [!WARNING] This module is part of an external package
> To use it, you must install [\`${packageName}\`](https://www.npmjs.com/package/${packageName}).
    `;

    const result = moduleTemplate
        .replace('%badge%', packageBadge)
        .replace('%preamble%', preamble)
        .replace('%content%', content)
        .replace('%title%', moduleName)
        .replace('%description%', data.description?.trim() ?? 'MISSING DESCRIPTION')
        .replace('%import%', formatModuleImport(isBuiltin, parentPath, packageName, moduleName));

    const outputContent = matter.stringify(result, {});

    fs.writeFileSync(outputFilename, outputContent);
}

function generateModuleDocumentation(dirent: fs.Dirent<string>): DefaultTheme.SidebarItem {
    const outputFilename = path.join(moduleDocOutputDir, dirent.name);
    const name = dirent.name.replace('.md', '');
    const absPath = path.join(dirent.parentPath, dirent.name);

    if (process.env.NODE_ENV === 'development') {
        chokidar.watch(absPath).on("change", () => {
            generateModulePage(name, absPath, outputFilename, dirent.parentPath);
        });
    }

    generateModulePage(name, absPath, outputFilename, dirent.parentPath);

    return {
        link: `/module-reference/${dirent.name}`,
        text: name,
    };
}

function isModuleDocumentationFile(file: fs.Dirent): boolean {
    const isMarkdown = file.isFile() && file.name.endsWith('.md');
    if (!isMarkdown) {
        return false;
    }

    if (file.name === 'index.md') {
        return false;
    }

    const content = fs.readFileSync(path.join(file.parentPath, file.name), 'utf-8');

    return matter(content).data.template === 'module';
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
    description: 'A VitePress Site',
    head: [['link', { rel: 'icon', href: '/favicon.svg' }]],
    themeConfig: {
        logo: { alt: 'Piero Logo', src: '/favicon.svg' },

        search: {
            provider: 'local',
        },

        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { link: '/', text: 'Home' },
            { link: '/getting-started', text: 'Guide' },
            { link: '/module-reference', text: 'Modules' },
        ],

        sidebar: [
            {
                items: [
                    { link: '/what-is-piero', text: 'What is Piero ?' },
                    { link: '/getting-started', text: 'Getting started' },
                    { link: '/create-piero-app', text: 'createPieroApp' },
                    { link: '/configuration', text: 'Configuration' },
                    { link: '/modules', text: 'Modules' },
                ],
                text: 'Introduction',
            },
            {
                items: collectModuleDocumentationFiles(),
                text: 'Module reference',
            },
        ],

        socialLinks: [{ icon: 'gitlab', link: 'https://gitlab.com/giro3d/piero' }],
    },
    title: 'Piero',
});
