function downloadAsJson(object: object, filename: string): void {
    const text = JSON.stringify(object, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    downloadBlob(blob, filename);
}

function downloadBlob(object: Blob | MediaSource, filename: string): void {
    const blobUrl = URL.createObjectURL(object);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.innerHTML = 'Click here to download the file';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
}

let baseUrl = import.meta.env.PROD ? import.meta.env.BASE_URL : undefined;

function getBaseUrl(fallback: string = 'http://localhost:8080/'): string {
    const url = baseUrl ?? fallback;
    return url.at(-1) === '/' ? url : url + '/';
}

function setBaseUrl(url: string): void {
    baseUrl = url;
}

export default { downloadAsJson, downloadBlob, getBaseUrl, setBaseUrl };
