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
    getContext(url: string, options?: RequestInit): FetchContext;
    getJson<T extends object>(url: UrlOrData, options?: RequestInit): Promise<T>;
    getText(url: UrlOrData, options?: RequestInit): Promise<string>;
}

/** URL to load or Blob (drag-and-drop) */
export type UrlOrData = Blob | string;

/** URL to load, or Response (already loaded), or Blob (drag-and-drop) */
export type UrlOrFetchedData = Blob | Response | string;

/** @internal */
export class HttpApiImpl implements HttpApi {
    public getContext(url: UrlOrFetchedData): FetchContext {
        return Fetcher.getContext(url);
    }

    public getJson<T extends object>(url: Blob | string, options?: RequestInit): Promise<T> {
        return Fetcher.fetchJson<T>(url, options);
    }

    public getText(url: Blob | string, options?: RequestInit): Promise<string> {
        return Fetcher.fetchText(url, options);
    }
}
