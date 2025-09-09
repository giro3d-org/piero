/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    root: true,
    plugins: ['@typescript-eslint', 'eslint-plugin-tsdoc', 'eslint-plugin-prettier'],
    parser: 'vue-eslint-parser',
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        '@vue/eslint-config-typescript',
        '@vue/eslint-config-prettier/skip-formatting',
    ],
    parserOptions: {
        project: './tsconfig.eslint.json',
        ecmaVersion: 'latest',
        parser: '@typescript-eslint/parser',
    },
    rules: {
        'vue/multi-word-component-names': 'off',

        // Use the same config as Giro3D, minor some unnecessary/unwanted that are commented-out
        curly: 'error',
        'tsdoc/syntax': 'warn',
        'no-console': 'off', // let's log cleverly!
        eqeqeq: ['error', 'smart'],
        'no-plusplus': 'off',
        'arrow-parens': ['error', 'as-needed'],
        '@typescript-eslint/lines-between-class-members': 'off',
        'one-var': ['error', 'never'],
        // PIERO: No JS here, deactive
        // // We want to be able to import .ts files from .js files without mentioning the extension,
        // // otherwise the transpiled file would still import a .ts file and this would break.
        // 'import/extensions': 'off',
        'no-underscore-dangle': 'off',
        // we make heavy use of for loop, and continue is very handy when used correctly
        'no-continue': 'off',
        // PIERO: we shouldn't
        // 'no-param-reassign': 'off', // we use param reassign too much with targets
        // PIERO: force error
        // 'no-use-before-define': ['error', 'nofunc'],
        // same as airbnb, but allow for..of, because our babel config doesn't import generators
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
        // disabling this because it is not yet possible to be subtle enough.
        // For instance, ok:
        // [this.zoom, this.row, this.col] = values
        // is more readable than
        // this.zoom = values[0]; this.row = values[1], this.col = values[2]
        // or { foo, bar } = object; is better than foo = object.foo; bar = object.bar;
        //
        // But what about:
        // [, , z] = array VS z = array[2];
        // or
        //
        // color = this._activeChain()[this.active.point].color;
        // VS
        // ({color} = this._activeChain()[this.active.point])
        // ?
        // (yes, parenthesis are necessary)
        // So let's use our common sense here
        'prefer-destructuring': 'off',
        'no-bitwise': 'off', // we DO manipulate bits often enough, making this irrelevant
        'max-classes-per-file': 'off', // for me, if we export only one, I don't see the wrong here

        // Also apply TS rules from Giro3D
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
        // '@typescript-eslint/strict-boolean-expressions': 'error',
        '@typescript-eslint/no-unused-vars': [
            'error', // or "error"
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
            },
        ],
    },
};
