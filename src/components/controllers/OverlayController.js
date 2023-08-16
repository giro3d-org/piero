import Overlay from "../../types/Overlay.js"

const overlays = [
    new Overlay('Arbres d\'alignement'),
    new Overlay('Prévision de travaux de la Métropole de Lyon'),
    new Overlay('Zones d\'activités économiques (ZAE)'),
    new Overlay('Végétation stratifiée 2018'),
    new Overlay('Réseau fibre'),
    new Overlay('Fontaines (gml)'),
    new Overlay('Footpath (gpx)'),
    new Overlay('Sytral lines (kml)'),
    new Overlay('Canopée (geojson)'),
]

function getOverlays()  {
    return overlays;
}

export default {
    getOverlays,
}