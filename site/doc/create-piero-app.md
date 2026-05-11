# `createPieroApp()`

This function is the entry point to a Piero application. It starts a Piero instance with the provided [configuration](./configuration.md), target DOM element, and [module](./modules.md) list.

## Example

### `index.html`

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

### `main.ts`

```js
import { createPieroApp } from '@giro3d/piero';
import '@giro3d/piero/piero.css';

createPieroApp({
    baseUrl: 'https://example.com/piero',
    container: '#app',
    configuration: "https://example.com/configuration.json"
    modules: [],
});
```

> [!TIP]
> Check the [default deployment](https://gitlab.com/giro3d/piero/-/blob/main/main.ts?ref_type=heads) for a more complete example on the `createPieroApp()` function.

## Parameters

### `baseUrl`

This is the base URL of your Piero app when it is deployed. This is used to resolve relative URLs.

### `container`

This is the DOM element, or the `id` of the DOM element that will be used to render the Piero application.

### `configuration`

The configuration to use. This can be either :

- a URL to a remote JSON configuration file
- a `Configuration` object

### `modules`

The list of [modules](./modules.md) to instantiate.

> [!WARNING]
> The list must contains the names of the module constructors, not instantiated modules!
>
> ```js
> import { ModuleFoo, ModuleBar, ModuleBaz } from '@giro3d/piero/modules';
>
> // Incorrect
> const modules = [new ModuleFoo(), new ModuleBar(), new ModuleBaz()];
>
> // Correct
> const modules = [ModuleFoo, ModuleBar, ModuleBaz];
> ```
