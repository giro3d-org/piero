# Piero Configuration

Piero can be customized via two files:

-   `src/config.ts` for the app configuration,
-   `src/styles.ts` for the overlay styles.

Sample configuration are available at [`src/config.ts.sample`](src/config.ts.sample) and [`src/styles.ts.sample`](src/styles.ts.sample).

When changing these files, you'll need to rebuild and redeploy your app.

## `config.ts`

The file **must** follow this pattern:

```typescript
// Import Configuration typing
import { Configuration } from './types/Configuration';

// Define configuration
const config: Configuration = {
    ...
};

// Export configuration
export default config;
```

The documentation of the configuration fields is defined in the TypeScript types of [`src/types/Configuration.ts`](src/types/Configuration.ts); your IDE should be able to guide you. The sample configuration is a good starting point.

To tweak your app, chances are you will first want to:

1. Change the default CRS: `default_crs` - note that until <https://gitlab.com/giro3d/piero/-/issues/26> is fixed, you'll need to make sure the CRS is registered in [Giro3DManager](src/services/Giro3DManager.ts) first,
2. Change the basemap extent: `basemap.extent`,
3. Change the camera position:
    - `camera.position` to set the position of the camera,
    - `camera.lookAt` to set where the camera looks at (if removed, the center of the extent will be used)
4. Change how the 3D map is displayed: `basemap.layers` sets how we get the elevation and what's being displayed as background
5. Change the 3D data displayed: `datasets`
6. Change the overlays displayed on the map: `overlays` (can be empty)
7. Change the default bookmarks: `bookmarks` (can be empty)

When defining layers and datasets, you can unleash Giro3D's advanced features via _some_ configuration. This is reserved for advanced users. You can generate the API doc for the configuration to dive deeper:

```bash
npx typedoc && npx http-server apidoc/
```

## `styles.ts`

The file **must** follow this pattern:

```typescript
// Import OpenLayers types
import { FeatureLike } from 'ol/Feature';
import { Fill, Stroke, Style, Text } from 'ol/style';

// Define styles
const styles = {
    ...
};

// Export configuration
export type DynamicStyleId = keyof typeof styles;

export default styles;
```

Each style consists in a key (that can be referenced in overlays) and a OpenLayer-like [StyleFunction](https://openlayers.org/en/v8.1.0/apidoc/module-ol_style_Style.html#~StyleFunction).

Such styles can be used to tweak the style based on properties of each feature.
