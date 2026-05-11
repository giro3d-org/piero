# Piero Configuration

Piero can be customized via a configuration file and via modules.

## Configuration file

Configuration file is a static configuration used at build-time. This is _not_ defined by default. More precisely: the piero core package defines [a default configuration](./packages/piero/src/configuration/defaultConfig.ts), while the app can override it (which is not done by default).

### Enabling static default configuration

1. Create a `config.ts` file at the root of the project (see below for the content)
2. Edit [`main.ts`](./main.ts) to import the file and use that configuration by default:

    ```diff
     import { analysis, loaders, misc, search } from '@giro3d/piero/modules';

    + import { appConfig } from './config';

     class Environment {

     ...

     const configurationUrl = params.get('config');
    -let configuration = undefined;
    +let configuration = appConfig;
     let fallback = false;

     if (configurationUrl != null) {
         try {
    ```

When changing the static configuration file, you'll need to rebuild and redeploy your app.

### `config.ts`

The file **must** follow this pattern:

```typescript
// Import Configuration typing
import type { Configuration } from '@giro3d/piero';

// Define configuration
const config: Configuration = {
    ...
};

// Export configuration
export default config;
```

The documentation of the configuration fields is defined in the TypeScript types of [`packages/piero/src/configuration/configuration.ts`](packages/piero/src/configuration/configuration.ts); your IDE should be able to guide you. The sample configuration is a good starting point.

To tweak your app, chances are you will first want to:

1. Define the CRS you will use: `crsDefinitions`
2. Change the scene's basemap extent: `scene.basemap.extent`,
3. Change the camera position: `scene.camera`
4. Change the data displayed: `data`

You can generate the API doc for the configuration to dive deeper:

```bash
npm run site:dev
```

### Remote config

When running Piero, you can also load remote configurations defined as JSON files instead of the static configuration. The content of the JSON configuration file is basically the same as the definition of the `config` variable in the `config.ts`.

Pass a `config` parameter in the app to use the remote config instead of the default one, e.g.: `http://localhost:8080/?config=http://example.com/config.json`.

## Modules

_Modules_ can extend functionality of Piero. To register modules with Piero, you must create your own web app that uses the Piero _library_ (`@giro3d/piero`).

The entry point of the library is [`createPieroApp()`](packages/piero/src/createPieroApp.ts). It allows injecting custom modules as well as the configuration.

> [!note]
> You can refer to [`main.ts`](main.ts) for more information on how to use Piero as a library.

### Module implementation

Modules interact with the application through interfaces defined in the `PieroContext` that is injected when the module is initialized.

```ts
import type { Module, PieroContext } from '@giro3d/piero';

class MyCustomModule implements Module {
    name = 'My custom module';

    initialize(context: PieroContext): void {
        console.log('initialized !');
    }
}
```

> [!warning]
> Although technically possible to interact with the application using other means (such as direct import of Pinia stores), this is discouraged as only the `PieroContext` is the official stable API.

## Environment variables

Piero's build uses some environment variables:

| variable          | Description                                                                                | Default value           |
| ----------------- | ------------------------------------------------------------------------------------------ | ----------------------- |
| `PIERO_BASE_URL`  | The URL of your server where the app is deployed, for example: <https://example.com/piero> | `http://localhost:8080` |
| `PIERO_APP_TITLE` | The title of your app                                                                      | `"Piero"`               |

> [!tip]
> Use the `.env` file as a template for `.env.local`.
