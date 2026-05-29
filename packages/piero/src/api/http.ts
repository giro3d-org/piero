import Fetcher from '@/utils/Fetcher';

/**
 * Info on a file.
 * Inspired by loaders.gl LoaderContext
 */
export interface FetchContext {
    /** Full URL of the resource (without query string) */
    baseUrl: string;
    /** Directory name (`baseUrl` up to the filename) */
    dirname: string;
    /** File extension */
    fileext?: string;
    /** Filename */
    filename: string;
    /** Query string (beginning with the leading `?` character) */
    queryString?: string;
}

export interface HttpApi {
    getContext(url: Blob | Response | string): FetchContext;
    getJson<T extends object>(url: Blob | string, options?: RequestInit): Promise<T>;
    getText(url: Blob | string, options?: RequestInit): Promise<string>;
}

/** @internal */
export class HttpApiImpl implements HttpApi {
    public getContext(url: Blob | Response | string): FetchContext {
        return Fetcher.getContext(url);
    }

    public getJson<T extends object>(url: Blob | string, options?: RequestInit): Promise<T> {
        return Fetcher.fetchJson<T>(url, options);
    }

    public getText(url: Blob | string, options?: RequestInit): Promise<string> {
        return Fetcher.fetchText(url, options);
    }
}
