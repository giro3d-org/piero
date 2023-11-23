export function getPublicFolderUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        // url is absolute
        return url;
    }
    if (import.meta.env.PROD) {
        return import.meta.env.BASE_URL + url;
    }
    return new URL(url, 'http://localhost:8080').toString();
}