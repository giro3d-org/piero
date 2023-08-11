import Basemap from "../types/Basemap"

const basemaps = [
    new Basemap('OSM'),
    new Basemap('Imagery'),
    new Basemap('Elevation'),
];

function getBasemaps() {
    return basemaps;
}

export {
    getBasemaps
}