import Fetcher from '@/utils/Fetcher';
import Instance from '@giro3d/giro3d/core/Instance';
import proj4 from 'proj4';

/**
 * Loads a Projection info and registers it in Giro3D if needed
 * @param projection - Projection code
 * @returns EPSG string (e.g. `EPSG:2154`)
 */
async function loadProjCrsIfNeeded(projection: string) {
    let epsgCode: string | null = null;

    const regexes = [
        /EPSG:+(\d+)/,
        /http:\/\/www.opengis.net\/def\/crs\/EPSG\/0\/(\d+)/,
        /https:\/\/www.opengis.net\/def\/crs\/EPSG\/0\/(\d+)/,
    ];
    for (const regex of regexes) {
        const search = projection.match(regex);
        if (search !== null) {
            epsgCode = search[1];
            break;
        }
    }

    if (epsgCode != null) {
        const epsgString = `EPSG:${epsgCode}`;
        if (proj4.defs(epsgString) === undefined) {
            const text = await Fetcher.fetchText(`https://epsg.io/${epsgCode}.proj4`);
            Instance.registerCRS(epsgString, text);
        }
        return epsgString;
    }
    throw new Error(`Could not find projection for ${projection}`);
}

export default { loadProjCrsIfNeeded };
