import skipFormattingConfig from '@vue/eslint-config-prettier/skip-formatting';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import eslintConfigPrettier from 'eslint-config-prettier';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier';
import tsdoc from 'eslint-plugin-tsdoc';
import pluginVue from 'eslint-plugin-vue';

/* eslint-disable perfectionist/sort-objects */

export default defineConfigWithVueTs([
    {
        ignores: ['dist/*', 'packages/*/dist/*'],
    },
    pluginVue.configs['flat/essential'],
    vueTsConfigs.recommendedTypeChecked,
    skipFormattingConfig,

    // From Giro3D general rules
    {
        plugins: {
            tsdoc,
            perfectionist,
            prettier,
        },

        rules: {
            curly: 'error',
            'tsdoc/syntax': 'warn',
            'no-console': 'off',
            eqeqeq: ['error', 'smart'],
            'no-plusplus': 'off',
            'arrow-parens': ['error', 'as-needed'],
            '@typescript-eslint/lines-between-class-members': 'off',
            'one-var': ['error', 'never'],
            'import/extensions': 'off',
            'no-underscore-dangle': 'off',
            'no-continue': 'off',
            'no-param-reassign': 'off',
            'no-use-before-define': ['error', 'nofunc'],

            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['**/api'],
                            message:
                                'API barrel files (api.ts) are reserved for API documentation generation. They must not be used by actual code.',
                        },
                    ],
                },
            ],

            'no-restricted-syntax': [
                'error',
                {
                    selector: 'ForInStatement',
                    message:
                        'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
                },
                {
                    selector: 'LabeledStatement',
                    message:
                        'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
                },
                {
                    selector: 'WithStatement',
                    message:
                        '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
                },
            ],

            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'classProperty',
                    format: ['camelCase'],
                    trailingUnderscore: 'forbid',
                },
                {
                    selector: 'classProperty',
                    modifiers: ['private'],
                    format: ['camelCase'],
                    leadingUnderscore: 'require',
                },
                {
                    selector: 'classProperty',
                    modifiers: ['protected'],
                    format: ['camelCase'],
                    leadingUnderscore: 'require',
                },
                {
                    selector: 'classProperty',
                    modifiers: ['public'],
                    format: ['camelCase'],
                    leadingUnderscore: 'forbid',
                },
            ],

            'prefer-destructuring': 'off',
            'no-bitwise': 'off',
            'max-classes-per-file': 'off',

            // Will be overriden
            'perfectionist/sort-imports': [
                'error',
                {
                    // internalPattern: ['^~/.+', '^@/.+', '^@giro3d/.*'],
                    internalPattern: ['^~/.+', '^@/.+'],
                },
            ],
        },
    },

    // From Giro3D TS rules
    {
        rules: {
            '@typescript-eslint/explicit-member-accessibility': 'error',
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/strict-boolean-expressions': 'error',

            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
        },
    },

    // Override Giro3D rules
    {
        rules: {
            'no-param-reassign': 'error',
            'no-use-before-define': 'off',
            '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
            'no-restricted-imports': 'off',
        },
    },

    // Vue.js
    {
        rules: {
            'vue/multi-word-component-names': 'off',
        },
    },

    // Piero TS
    {
        rules: {
            '@typescript-eslint/no-empty-object-type': [
                'error',
                {
                    allowInterfaces: 'with-single-extends',
                    allowObjectTypes: 'always',
                },
            ],
            '@typescript-eslint/restrict-template-expressions': [
                'error',
                { allowArray: true, allowNever: true, allowAny: true },
            ],
        },
    },

    // Piero perfectionist
    {
        plugins: {
            perfectionist,
        },
        rules: {
            ...perfectionist.configs['recommended-natural'].rules,
            'perfectionist/sort-imports': [
                'error',
                {
                    // internalPattern: ['^~/.+', '^@/.+', '^@giro3d/.*'],
                    internalPattern: ['^~/.+', '^@/.+'],
                },
            ],
            'perfectionist/sort-classes': [
                'error',
                {
                    partitionByComment: '// Region:',
                },
            ],
            'perfectionist/sort-interfaces': [
                'error',
                {
                    groups: ['property', 'method', 'unknown'],
                    partitionByComment: '// Region:',
                },
            ],
            'perfectionist/sort-union-types': [
                'error',
                {
                    groups: ['unknown', 'object', 'nullish'],
                },
            ],
            'perfectionist/sort-modules': [
                'error',
                {
                    groups: [
                        'declare-enum',
                        'enum',
                        ['declare-interface', 'declare-type'],
                        ['interface', 'type'],
                        'declare-class',
                        'class',
                        'declare-function',
                        'function',
                        'export-enum',
                        ['export-interface', 'export-type'],
                        'export-class',
                        'export-function',
                        [
                            'export-default-interface',
                            'export-default-class',
                            'export-default-function',
                        ],
                    ],
                    partitionByComment: '// Region:',
                },
            ],
            'perfectionist/sort-objects': [
                'error',
                {
                    partitionByComment: true,
                },
            ],
        },
    },

    // Piero Prettier
    {
        plugins: {
            prettier: prettier,
        },
        rules: {
            // @ts-expect-error possible undefined, but is not!
            ...prettier.configs.recommended.rules,
            ...eslintConfigPrettier.rules,
        },
    },
]);

/* eslint-enable perfectionist/sort-objects */
