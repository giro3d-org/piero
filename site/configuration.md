# Configuration

The configuration contains everything required to produce a distinct Piero app: which data to display, coordinate system configuration, custom module configuration, etc.

Configuration in Piero is provided either as remote JSON file, or a static `Configuration` object. Both variants have the same schema.

## Static `Configuration` object

### Using `ConfigurationBuilder`

Piero provides a convenience class to build configuration objects: `ConfigurationBuilder`.

```ts
import { ConfigurationBuilder } from '@giro3d/piero';

const config = new ConfigurationBuilder()
    .withDatasets(...)
    .withBookmarks(...)
    .build();
```

The `build()` method will then return the configuration if it is valid, or throw an exception if not.

### Manual definition

If you want to build the configuration yourself, you can start with the default configuration, modify it then validate it.

```ts
import { defaultConfiguration, validateConfiguration } from '@giro3d/piero';

const config = defaultConfiguration();

config.data = [
    /** your datasets here */
];
config.bookmarks = [
    /** your bookmarks here */
];

// Get the final configuration with default values set.
const finalConfig = validateConfiguration(config);

console.log('final config:', finalConfig);
```

> [!warning]
> Validation is vital to ensure that default values are properly set, as well as checking that the configuration is well-formed.

## Remote configurations

You can pass a URL to a remote configuration file as well. The file will be downloaded and validated by [`createPieroApp()`](./create-piero-app.md).

