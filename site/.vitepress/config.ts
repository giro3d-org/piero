import type { DefaultTheme } from 'vitepress';

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vitepress';
import chokidar from 'chokidar';
import typedocSidebar from '../api/typedoc-sidebar.json';

const projectRoot = path.join(__dirname, '../../');
const moduleDocOutputDir = path.join(__dirname, '../module-reference');
const moduleTemplate = fs.readFileSync(path.join(__dirname, 'module-doc-template.md'), 'utf-8');
const moduleReferenceTemplate = fs.readFileSync(path.join(__dirname, 'module-reference-template.md'), 'utf-8');

interface PackageMetadata {
    name: string; // @giro3d/piero*
    items: ModuleMetadata[];
}

interface ModuleMetadata {
    name: string;
    package: string;
    category?: string;
    documentationFile: string;
    path: string;
}

function groupBy<T, K extends keyof T>(items: T[], key: K): Map<T[K], T[]> {
const result: Map<T[K], T[]> = new Map();

items.forEach(item => {
    const keyValue = item[key];
    if (!result.has(keyValue)) {
        result.set(keyValue, []);
    }

    result.get(keyValue)!.push(item);
})

return result;
}

function generateModuleReferenceIndex(packages: PackageMetadata[]) {
    const content = moduleReferenceTemplate;

    const sortedPackages = packages.sort((a, b) => a.name.localeCompare(b.name));

    const sections: string[] = []

    for (const pkg of sortedPackages) {
        const title = `## \`${pkg.name}\``;

        const categories = [...groupBy(pkg.items, 'category')].map(([cat, modules]) => {
            const entries = modules.map(md => `- [${md.name}](./${md.name}.md)`);
            return `### ${cat}\n${entries.join('\n')}`
        });

        const groupMarkdown = `${title}\n\n${categories.join('\n')}`

        sections.push(groupMarkdown);
    }

    const result = content.replace('%content%', sections.join('\n'));

    fs.writeFileSync(path.join(moduleDocOutputDir, 'index.md'), result);
}

function collectModuleMetadata(packageName: string, packagePath: string): ModuleMetadata[] {
    return fs
        .readdirSync(packagePath, { encoding: 'utf-8', recursive: true, withFileTypes: true })
        .filter(isModuleDocumentationFile)
        .map(dirent => ({
                package: packageName,
                documentationFile: dirent.name,
                category: getBuiltinModuleRoot(dirent.parentPath),
                name: dirent.name.replace('.md', ''),
                path: path.join(dirent.parentPath, dirent.name)
        }));
}

function collectPackageMetadata(): PackageMetadata[] {
    const packageRoot = path.join(projectRoot, 'packages');

    return fs
        .readdirSync(packageRoot, { encoding: 'utf-8', recursive: false, withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => {
            const packageName =`@giro3d/${dirent.name}`;
            return {
                name: packageName,
                items: collectModuleMetadata(packageName, path.join(dirent.parentPath, dirent.name))
            }
        })
        .sort((a, b) => a.name.localeCompare(b.name))
}

function collectModuleDocumentationFiles(): DefaultTheme.SidebarItem[] {
    if (!fs.existsSync(moduleDocOutputDir)) {
        fs.mkdirSync(moduleDocOutputDir);
    }

    const packages = collectPackageMetadata();

    generateModuleReferenceIndex(packages);

    const sidebarItems: DefaultTheme.SidebarItem[] = packages.map(pkg => {
        const categories = [...groupBy(pkg.items, 'category')];

        return {
            text: pkg.name,
            items: categories.map(([cat, items]) => ({
                text: cat,
                items: items.map(generateModuleDocumentation)
            }))
        }

    })

    return sidebarItems;
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

function generateModuleDocumentation(moduleMetadata: ModuleMetadata): DefaultTheme.SidebarItem {
    const outputFilename = path.join(moduleDocOutputDir, moduleMetadata.name + '.md');
    const name = moduleMetadata.name;
    const absPath = moduleMetadata.path;
    const parentPath = path.dirname(absPath);

    if (process.env.NODE_ENV === 'development') {
        chokidar.watch(absPath).on("change", () => {
            generateModulePage(name, absPath, outputFilename, parentPath);
        });
    }

    generateModulePage(name, absPath, outputFilename, parentPath);

    return {
        link: `/module-reference/${moduleMetadata.name}`,
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
            { link: 'https://piero.giro3d.org/demo/', text: 'Demo', target: '_blank', rel: 'demo' },
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
                text: 'Modules',
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
