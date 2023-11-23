import proj4 from 'proj4';
import Instance from '@giro3d/giro3d/core/Instance.js';

async function loadProjCrsIfNeeded(projection: string) {
    let epsgCode;

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

    if (epsgCode) {
        if (proj4.defs(`EPSG:${epsgCode}`) === undefined) {
            await fetch(`https://epsg.io/${epsgCode}.proj4`).then(p => p.text()).then(t => {
                Instance.registerCRS(`EPSG:${epsgCode}`, t);
            });
        }
        return epsgCode;
    }
    throw new Error(`Could not find projection for ${projection}`);
}

export default { loadProjCrsIfNeeded };
