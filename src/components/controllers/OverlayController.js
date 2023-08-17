import VectorSource from '@giro3d/giro3d/sources/VectorSource.js'
import GeoJSON from 'ol/format/GeoJSON.js'
import { Style, Fill, Stroke } from 'ol/style.js'
import Overlay from "../../types/Overlay.js"

import Giro3DController from './Giro3DController.js'

const overlays = [
    new Overlay('Arbres d\'alignement'),
    new Overlay('Prévision de travaux de la Métropole de Lyon'),
    new Overlay('Zones d\'activités économiques (ZAE)'),
    new Overlay('Végétation stratifiée 2018'),
    new Overlay('Réseau fibre'),
    new Overlay('Fontaines (gml)'),
    new Overlay('Footpath (gpx)'),
    new Overlay('Sytral lines (kml)'),

    new Overlay('Canopée (geojson)', new VectorSource({
        data: 'https://3d.oslandia.com/lyon/evg_esp_veg.evgparcindiccanope_latest.geojson',
        format: new GeoJSON(),
        dataProjection: 'EPSG:4171',
        style: feature => new Style({
            fill: new Fill({
                color: `rgba(0, 128, 0, ${feature.get('indiccanop')})`,
            }),
            stroke: new Stroke({
                color: 'white',
            }),
        }),
    }),),
]

function getOverlays()  {
    return overlays;
}

export default {
    getOverlays,
}