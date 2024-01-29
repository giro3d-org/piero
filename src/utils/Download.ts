function downloadBlob(object: Blob | MediaSource, filename: string) {
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

function downloadAsJson(object: any, filename: string) {
    const text = JSON.stringify(object, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    downloadBlob(blob, filename);
}

function getBaseUrl(fallback: string = 'http://localhost:8080') {
    if (import.meta.env.PROD) {
        return import.meta.env.BASE_URL;
    }
    return fallback;
}

export default { downloadBlob, downloadAsJson, getBaseUrl };
