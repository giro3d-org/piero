interface DependencyInfo {
    description?: string;
    license?: string;
    homepage?: string;
}

/**
 * Defines variables thay *may* be defined in the environment (e.g. .env or .env.local files) and
 * can be referenced as `import.meta.env.FOOBAR`.
 * Note that only variables prefixed by `VITE_` are exposed in the app.
 * See <https://vitejs.dev/guide/env-and-mode.html> for more info.
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

    readonly PROD: boolean;
    readonly BASE_URL: string;
    readonly VITE_DEPENDENCIES: Record<string, DependencyInfo>;
    readonly VITE_GIT_COMMIT: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
