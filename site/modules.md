# Modules

In Piero, a module is a piece of self-contained code (and optionally assets such as images) that provides additional functionality to the application.

All modules are **optional**: although a Piero app without any module is not very useful, it still runs.

> [!TIP] Module organization
> How you organize your modules is up to you, but we recommend creating **one module per feature**. For example, if you want to add support for two different data types in Piero, you could either create a single module that provide both dataset types, or two different modules.

## Built-in modules and external plugins

Modules are either **built-in** (provided as part of the core `@giro3d/piero` package), or provided by **external packages** (e.g `@giro3d/piero-plugin-cityjson`). In both cases, modules work in the same way, except that you have to first install the required package to make use of external modules.

## How to implement a module

A module is a class that implements the `Module` interface.

### A simple module

Let's implement a simple module called `Greetings`.

```ts
// Greetings.ts
import type { Module, PieroContext } from '@giro3d/piero';

export default class Greetings implements Module {
    public readonly id = 'plugin-greetings';
    public readonly name = 'Greetings';

    public initialize(context: PieroContext) {
        console.log('Hello !');
    }
}
```

### The structure of a module

#### `id`

This is the unique identifier for the module. It is used to locate the module configuration in the configuration file without ambiguity. Built-in modules have identifiers that start with `builtin-*` and modules coming from external packages have identifiers that start with `plugin-*`.

> [!TIP]
> To avoid collisions when combining your own modules and modules coming from various sources, use your own prefix, such as `plugin-mycompany-*`.

#### `name`

This is the readble name of the module, mostly used for nice formatting in the interface.

#### `initialize()`

This is where module initialization occurs and where the module interacts with the Piero API. The single entry point for the API is the `PieroContext` object that is passed as argument.

The `PieroContext` objects contains various APIs to interact with the Piero app, as well as the configuration.

## Using the module in your app

To make use of features provided by a module, it has to be included in your application. This is done by addind your module in the `modules` parameter of the [`createPieroApp`](./create-piero-app.md) function:

```ts
import { createPieroApp } from '@giro3d/piero';
import { Greetings } from 'myCustomPackage';

createPieroApp({
    ...
    modules: [Greetings]
})
```

> [!WARNING]
> The module list contains the **constructors of the modules**, not instances. This is because the instantiation inside `createPieroApp()`. The following code is incorrect:
> ```ts
> import { createPieroApp } from '@giro3d/piero';
> import { Greetings } from 'myCustomPackage';
>
> createPieroApp({
>    ...
>    modules: [new Greetings()] // Don't instantiate the module
>})
> ```

### Configuration

Modules are configured in the [configuration](./configuration.md), rather than at instantiation.
This makes it possible to change the behaviour of a module by simply swapping the configuration, without having to change the initialization logic of Piero.

The configuration has a `modules` property that contains an optional entry per module (the key is the module
`id`):

```json
// configuration.json
{
    ...,
    "modules": {
        // Your custom configuration here
        "plugin-greetings": {
            "message": "Hello, world!"
        }
    }
}
```

This configuration can then be read during the initialization of the module by reading the `configuration` property in the `context` parameter. Here is the updated example with our `Greetings` module that reads the greetings message directly from the configuration:

```ts
// Greetings.ts
import type { Module, PieroContext } from '@giro3d/piero';

export default class Greetings implements Module {
    public readonly id = 'plugin-greetings';
    public readonly name = 'Greetings';

    public initialize(context: PieroContext) {
        const configuration = context.configuration;
        const message = configuration.modules['plugin-greetings'].message;
        console.log(message);
    }
}
```
