import type { DefaultTheme } from 'vitepress';

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vitepress';
import chokidar from 'chokidar';
import typedocSidebar from '../api/typedoc-sidebar.json';

const projectRoot = path.join(__dirname, '../../../');
const moduleDocOutputDir = path.join(__dirname, '../module-reference');
const moduleTemplate = fs.readFileSync(path.join(__dirname, 'module-doc-template.md'), 'utf-8');

function collectModuleDocumentationFiles(): DefaultTheme.SidebarItem[] {
    const packageRoot = path.join(projectRoot, 'packages');


    const groups: Map<string, DefaultTheme.SidebarItem[]> = new Map();


    fs
        .readdirSync(packageRoot, { encoding: 'utf-8', recursive: true, withFileTypes: true })
        .filter(isModuleDocumentationFile)
        .forEach(dirent => {
            const item = generateModuleDocumentation(dirent);
            const category = getBuiltinModuleRoot(dirent.parentPath);
            if (!groups.has(category)) {
                groups.set(category, []);
            }

            groups.get(category)?.push(item)
        });

    return [...groups.entries()].map(([category, items]) => ({
        items: items.sort((a, b) => a.text!.localeCompare(b.text!)),
        text: category,
    }) as DefaultTheme.SidebarItem)

}

function getBuiltinModuleRoot(parentPath: string) {
    // The module root is the name of the directory under modules/, for example, "loaders", "misc".
    // This is what the Piero API exports.
    // The actual module might be in a deeply nested sub-directory, but we are really interested in
    // getting the import path.
    const fragments = parentPath.split('/');
    const moduleRoot = fragments.indexOf('modules');
    return fragments[moduleRoot + 1];
}

function formatModuleImport(
    isBuiltin: boolean,
    parentPath: string,
    packageName: string,
    moduleName: string,
): string {
    const importPath = isBuiltin ? '@giro3d/piero/modules' : `${packageName}`;
    const importedModule = isBuiltin ? getBuiltinModuleRoot(parentPath) : moduleName;
    const moduleEntry = isBuiltin
        ? `${importedModule}.${moduleName}`
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

    const packageBadge = `<Badge type="${isBuiltin ? 'info' : 'warning'}"><a href="/api/${packageName}">${packageName}</a></Badge>`;

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
    description: 'Geospatial visualization for the web',
    lang: 'en-US',
    head: [['link', { rel: 'icon', href: '/static/favicon.svg' }]],
    themeConfig: {
        logo: { alt: 'Piero Logo', src: '/static/favicon.svg' },

        search: {
            provider: 'local',
        },

        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { link: '/', text: 'Home' },
            { link: '/getting-started', text: 'Guide' },
            { link: '/module-reference', text: 'Modules' },
            { text: 'API', link: '/api/' },
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
            {
                text: 'API',
                items: typedocSidebar,
            }
        ],

        socialLinks: [{ icon: 'gitlab', link: 'https://gitlab.com/giro3d/piero' }],
    },
    title: 'Piero',
});
