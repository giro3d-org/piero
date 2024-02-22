# Piero

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Project Setup

### With the `init.sh` script

On compatible platforms, you can use the `init.sh` script to initialize the configuration.

### Manually

1. Install npm dependencies
2. Copy the default App configuration

```sh
npm install
cp src/config.ts.sample src/config.ts
cp src/styles.ts.sample src/styles.ts
```

### Compile and Hot-Reload for Development

```sh
npm run start
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
