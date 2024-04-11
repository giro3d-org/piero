interface DependencyInfo {
    description?: string;
    license?: string;
    homepage?: string;
}

/**
 * Defines variables thay *may* be defined in the environment (e.g. .env or .env.local files) and
 * can be referenced as `import.meta.env.FOOBAR`.
 * Note that only variables prefixed by `VITE_` are exposed in the app.
 * See https://vitejs.dev/guide/env-and-mode.html for more info.
 */
interface ImportMetaEnv {
    /**
     * If the app requires "Authorization" headers for a domain, set this variable to the path (e.g. `https://mydomain/foo/bar`)
     */
    readonly VITE_AUTHORIZATION_DOMAIN?: string;
    /**
     * If the app requires "Authorization" headers for a domain, set this variable to the header value (e.g. `Basic foobar=`)
     */
    readonly VITE_AUTHORIZATION_VALUE?: string;

    /**
     * If the app requires "Authorization" headers for multiple paths, set this variable to a string-typed object with host as keys and headers as values.
     *
     * Example:
     * ```
     * VITE_AUTHORIZATIONS="{
     * 'https://3d.oslandia.com/mypath': 'Basic V6d1y/39htSu2av+gx3Tkg==',
     * 'https://example.com/': 'Basic hZsFiDj4ZbQ8QrkDVqV7ug=='
     * }"
     * ```
     */
    readonly VITE_AUTHORIZATIONS?: Record<string, string>;

    /**
     * If the app requires custom headers for domains, set this variable to a string-typed object with host as keys and name:value as values.
     *
     * Example:
     * ```
     * VITE_HEADERS="{
     * 'https://3d.oslandia.com/myfirstdomain': {'X-API-Token': 'mytoken'},
     * 'https://example.com/': {'X-Custom-Header': 'value'}
     * }"
     * ```
     */
    readonly VITE_HEADERS?: Record<string, Record<string, string>>;

    readonly PROD: boolean;
    readonly BASE_URL: string;
    readonly VITE_DEPENDENCIES: Record<string, DependencyInfo>;
    readonly VITE_GIT_COMMIT: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
