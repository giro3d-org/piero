import Fetcher from '@giro3d/giro3d/utils/Fetcher';
import { DataType } from '@loaders.gl/core';

export type UrlOrBlob = string | Blob | Response;
export type UrlOrGlDataType = string | DataType;

/**
 * Fetches a url and returns a Blob-like object
 * @param url URL or Blob-like object
 * @returns Blob-like object
 */
async function blob(url: UrlOrBlob): Promise<Blob | Response> {
    if (url instanceof Blob || url instanceof Response) return url;
    return Fetcher.fetch(url);
}

/**
 * Fetches a url, Blob-like object or ArrayBuffer and returns an ArrayBuffer object
 * @param url URL or Blob-like object or ArrayBuffer
 * @returns ArrayBuffer
 */
async function arrayBuffer(url: UrlOrBlob | ArrayBuffer): Promise<ArrayBuffer> {
    if (url instanceof ArrayBuffer) return url;
    const content = await blob(url);
    return content.arrayBuffer();
}

/**
 * Fetches a url or Blob-like object and returns the content as a string
 * @param url URL or Blob-like object
 * @returns Content as string
 */
async function text(url: UrlOrBlob): Promise<string> {
    const content = await blob(url);
    return content.text();
}

/**
 * Fetches a url or Blob-like object and returns the content as a JSON object
 * @param url URL or Blob-like object
 * @returns Content as JSON object
 */
async function json(url: UrlOrBlob): Promise<any> {
    const content = await text(url);
    return JSON.parse(content);
}

export default { blob, arrayBuffer, text, json };
