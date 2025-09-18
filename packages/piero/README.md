<div align="center">
  <a href="https://piero.giro3d.org">
    <img src="https://piero.giro3d.org/piero_logo.svg" height="120" alt="Piero">
  </a>
</div>

<div align="center">
  A versatile web library to visualize 3D geospatial data in the browser.
</div>

<br>

<div align="center">
  <a href="https://gitlab.com/giro3d/piero/badges/main/pipeline.svg"><img src="https://gitlab.com/giro3d/piero/badges/main/pipeline.svg" alt="Pipeline status"></a>
  <a href="https://www.npmjs.com/package/@giro3d/piero"><img alt="NPMJS latest package badge" src="https://img.shields.io/npm/v/@giro3d/piero?color=blue"></a>
  <a href="https://matrix.to/#/#giro3d:matrix.org"><img src="https://img.shields.io/matrix/giro3d:matrix.org" alt="Matrix chat"></a>
</div>

## The Piero library

This is the library version of the [Piero web application](https://giro3d.org/piero.html). The library version allows you to customize and use your own modules and plugins.

## Getting started

This library is built with Vue.js, but you don't need Vue to use the library (unless you want to write your own components).

```shell
npm install @giro3d/piero
```

Then create an `index.html` file

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>My custom Piero app</title>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="./index.ts"></script>
    </body>
</html>
```

And an `index.ts` file:

```ts
// index.ts
import { createPieroApp } from '@giro3d/piero';

import configuration from './config';

createPieroApp({
    container: '#app',
    baseUrl: 'http://localhost:8080/',
    configuration,
});
```

Create the `config.ts` file in the same folder as `index.ts`, and fill it with your configuration (you can use the [sample configuration](https://gitlab.com/giro3d/piero/-/blob/main/config.ts.sample) as a starting point).

Bundle your application and run it. For example with Vite:

```shell
vite --port 8080
```

Then open your browser at <http://localhost:8080>.

This is the minimal configuration to use the Piero library.

### Using a remote configuration

Alternatively, you can pass a URL to a remote JSON configuration

```ts
// index.ts
import { createPieroApp } from '@giro3d/piero';

createPieroApp({
    container: '#app',
    baseUrl: 'http://localhost:8080/',
    configuration: 'https://example.com/config.json',
});
```

### Deploying

To deploy your app, update the `baseUrl` to be the URL from which the app is served. For example, if you want your app to be accessible from `https://example.com/piero`, the base URL would be (don't forget the slash):

```ts
// index.ts
import { createPieroApp } from '@giro3d/piero';

createPieroApp({
    container: '#app',
    baseUrl: 'https://example.com/piero/',
    configuration: 'https://example.com/config.json',
});
```

## Register custom modules

You can register your own modules (classes that implement the `Module` interface) at startup:

```ts
// index.ts
import { createPieroApp, Module } from '@giro3d/piero';

class MyCustomModule implements Module {
    name = 'A custom module';

    initialize(context: PieroContext) {
        console.log('hello, world!');
    }
}

createPieroApp({
    container: '#app',
    baseUrl: 'https://example.com/piero/',
    configuration: 'https://example.com/config.json',
    modules: [new MyCustomModule()],
});
```

Refer to [CONFIGURATION.md](https://gitlab.com/giro3d/piero/-/blob/main/CONFIGURATION.md) for more information.
