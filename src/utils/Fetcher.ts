import Fetcher from '@giro3d/giro3d/utils/Fetcher';
import { fetchFile } from '@loaders.gl/core';
import { getPublicFolderUrl } from './Configuration';

/** URL to load or Blob (drag-and-drop) */
export type UrlOrData = string | Blob;
/** URL to load, or Response (already loaded), or Blob (drag-and-drop) */
export type UrlOrFetchedData = string | Response | Blob;

/**
 * Info on a file.
 * Inspired by loaders.gl LoaderContext
 */
export interface FetchContext {
    /** Full URL of the resource (without query string) */
    baseUrl: string;
    /** Query string (beginning with the leading `?` character) */
    queryString?: string;
    /** Directory name (`baseUrl` up to the filename) */
    dirname: string;
    /** Filename */
    filename: string;
    /** File extension */
    fileext?: string;
}

/**
 * Checks a host is parsable and starts with `http(s)://`.
 * This is useful when passing hosts to Giro3D's HttpConfiguration.
 *
 * @param host - Host (e.g. https://example.com/foobar)
 * @returns true if valid
 */
function checkAbsoluteHost(host: string): boolean {
    return URL.canParse(host) && (host.startsWith('http://') || host.startsWith('https://'));
}

/**
 * Fetcher that is able to fetch a URL (if string) or make a Response from a File-object.
 *
 * This redefines loaders.gl's fetch function to use Giro3D's fetcher.
 *
 * @param urlOrData - URL to fetch or Blob
 * @param fetchOptions - fetch options
 * @returns The response object
 */
function fetchInternal(urlOrData: UrlOrData, fetchOptions?: RequestInit): Promise<Response> {
    if (typeof urlOrData === 'string') {
        const url = getPublicFolderUrl(urlOrData);
        return Fetcher.fetch(url, fetchOptions);
    }

    return fetchFile(urlOrData, fetchOptions);
}

async function toDataURL(url: UrlOrData): Promise<string> {
    return new Promise((resolve, reject) => {
        if (typeof url === 'string') {
            return getPublicFolderUrl(url);
        } else {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result as string), false);
            reader.addEventListener('error', () => reject(reader.error));
            reader.readAsDataURL(url);
        }
    });
}

/**
 * Fetches a url, Blob-like object and returns an ArrayBuffer object
 * @param url - URL or Blob-like object
 * @param fetchOptions - fetch options
 * @returns ArrayBuffer
 */
async function fetchArrayBuffer(url: UrlOrData, fetchOptions?: RequestInit): Promise<ArrayBuffer> {
    const f = await fetchInternal(url, fetchOptions);
    return f.arrayBuffer();
}

/**
 * Fetches a url or Blob-like object and returns the content as a string
 * @param url - URL or Blob-like object
 * @param fetchOptions - fetch options
 * @returns Content as string
 */
async function fetchText(url: UrlOrData, fetchOptions?: RequestInit): Promise<string> {
    const f = await fetchInternal(url, fetchOptions);
    return f.text();
}

/**
 * Fetches a url or Blob-like object and returns the content as a JSON object
 * @param params - URL or Blob-like object
 * @param fetchOptions - fetch options
 * @returns Content as JSON object
 * @typeParam T - Type of the JSON object returned
 */
async function fetchJson<T extends object = object>(
    url: UrlOrData,
    fetchOptions?: RequestInit,
): Promise<T> {
    const f = await fetchInternal(url, fetchOptions);
    const json: T = await f.json();
    return json;
}

/**
 * Gets the context from a url, Response or Blob-like object
 * @param urlOrFetchedData - URL, Response or Blob-like object
 * @returns Fetch context
 */
function getContext(urlOrFetchedData: UrlOrFetchedData): FetchContext {
    let baseUrl: string;
    let queryString: string | undefined;

    if (urlOrFetchedData instanceof Response) {
        const url = new URL(urlOrFetchedData.url);
        baseUrl = `${url.origin}${url.pathname}`;
        queryString = url.search;
    } else if (urlOrFetchedData instanceof File) {
        baseUrl = urlOrFetchedData.name;
    } else if (urlOrFetchedData instanceof Blob) {
        baseUrl = '';
    } else if (typeof urlOrFetchedData === 'string') {
        const absoluteUrl = getPublicFolderUrl(urlOrFetchedData);
        const url = new URL(absoluteUrl);
        baseUrl = `${url.origin}${url.pathname}`;
        queryString = url.search;
    } else {
        // Exhaustiveness checking
        const _exhaustiveCheck: never = urlOrFetchedData;
        return _exhaustiveCheck;
    }

    const parts = baseUrl.split('/');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const filename = parts.pop()!;
    const dirname = parts.join('/');

    return {
        baseUrl,
        queryString,
        filename,
        fileext: filename?.split('.').at(-1),
        dirname,
    };
}

export default {
    checkAbsoluteHost,
    fetch: fetchInternal,
    fetchArrayBuffer,
    fetchText,
    fetchJson,
    getContext,
    toDataURL,
};
