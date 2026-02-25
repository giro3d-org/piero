# Getting started with Piero

## Prerequisites

This guide assumes you have knowledge with NPM and TypeScript. Knowledge with [Vue](https://vuejs.org/) is not required, unless you want to write your own UI components, such as widgets.

## A basic Piero app

> [!note]
> This guide requires Node.js 23 or later and NPM 11 or later.

Here is a basic example using [Vite](https://vite.dev/) and TypeScript.

1. Create an empty folder

```shell
mkdir app
cd app
```

2. Initialize your NPM project in it and follow the prompts

```shell
npm init
```

3. Install Vite and Piero

```shell
npm install @giro3d/piero
npm install vite -D
```

4. Create the `index.html` file, with the following content

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Piero example</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="./main.ts"></script>
    </body>
</html>
```

5. Create the `main.ts` file with the following content

```ts
import { createPieroApp, PieroApplication } from '@giro3d/piero';
import { all } from '@giro3d/piero/modules';
import '@giro3d/piero/piero.css';

async function main(): Promise<PieroApplication> {
    const app = await createPieroApp({
        container: '#app',
        modules: all,
    });

    return app;
}

main()
    .then(app => app.context.notifications.success('main', 'Piero has been loaded successfully'))
    .catch(e => console.error(e));
```

6. Start Piero in development mode

```shell
npx vite --port 8080
```

7. Open your browser at the following URL: <http://localhost:8080>. You should see the Piero app
   loaded with the default (minimal) configuration.

> [!tip]
> If your browser does not display the Piero app, check the browser console and look for errors.
