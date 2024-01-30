import Download from "./Download";

export function getPublicFolderUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        // url is absolute
        return url;
    }

    return new URL(url, Download.getBaseUrl()).toString();
}
