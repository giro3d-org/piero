import VectorSource from '@giro3d/giro3d/sources/VectorSource.js'
import * as format from 'ol/format'
import GML32 from 'ol/format/GML32';
import { Style, Fill, Stroke, RegularShape } from 'ol/style.js'
import Overlay from "../../types/Overlay"

import MainController from './MainController.js'
import LayerManager from './LayerManager.js'
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer'
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource';
import TileWMS from 'ol/source/TileWMS';
import Instance from '@giro3d/giro3d/core/Instance';

const overlays = [
    new Overlay('overlay-arbres', 'Alignement d\'arbres', (instance: Instance) => new TiledImageSource({
        source: new TileWMS({
            url: 'https://download.data.grandlyon.com/wms/grandlyon',
            projection: instance.referenceCrs,
            params: {
                LAYERS: ['metropole-de-lyon:abr_arbres_alignement.abrarbre'],
                FORMAT: 'image/png',
                VERSION: '1.3.0',
            },
        }),
    })),

    new Overlay('overlay-travaux', 'Prévision de travaux de la Métropole de Lyon', (instance: Instance) => new TiledImageSource({
        source: new TileWMS({
            url: 'https://download.data.grandlyon.com/wms/rdata',
            projection: instance.referenceCrs,
            params: {
                LAYERS: ['lyv_lyvia.lyvchantier'],
                FORMAT: 'image/png',
                VERSION: '1.3.0',
            },
        }),
    })),

    new Overlay('overlay-zae', 'Zones d\'activités économiques (ZAE)', (instance: Instance) => new TiledImageSource({
        source: new TileWMS({
            url: 'https://download.data.grandlyon.com/wms/grandlyon',
            projection: instance.referenceCrs,
            params: {
                LAYERS: ['adr_voie_lieu.adrzae'],
                FORMAT: 'image/png',
                VERSION: '1.3.0',
            },
        }),
    })),

    new Overlay('overlay-vegetation', 'Végétation stratifiée 2018', (instance: Instance) => new TiledImageSource({
        source: new TileWMS({
            url: 'https://download.data.grandlyon.com/wms/rdata',
            projection: instance.referenceCrs,
            params: {
                LAYERS: ['MNC_class_2022_INT1U'],
                FORMAT: 'image/png',
                VERSION: '1.3.0',
            },
        }),
    })),

    new Overlay('overlay-fibre', 'Réseau fibre', (instance: Instance) => new TiledImageSource({
        source: new TileWMS({
            url: 'https://download.data.grandlyon.com/wms/rdata',
            projection: instance.referenceCrs,
            params: {
                LAYERS: ['tel_telecom.telfibreripthd_1'],
                FORMAT: 'image/png',
                VERSION: '1.3.0',
            },
        }),
    })),

    new Overlay('overlay-fontaines', 'Fontaines (GML)', () => new VectorSource({
        data: 'https://3d.oslandia.com/lyon/adr_voie_lieu.adrbornefontaine_latest.gml',
        dataProjection: 'EPSG:4171',
        format: new GML32(),
        style: (feature, resolution) => new Style({
            // Adapt size to resolution, so the shape takes approximately
            // always the same size, and in meters :)
            // This assumes pixelRatio of resolution is 1 and that the CRS
            // is in meters.
            // If true, 10 / resolution corresponds to 10 meters
            image: new RegularShape({
                // Radius of 5m
                radius: 2.5 / resolution,
                points: 4,
                stroke: new Stroke({
                    width: 2 / resolution,
                    color: [255, 255, 255, 1],
                }),
                fill: new Fill({
                    color: [0, 150, 255, 1],
                }),
            }),
        }),
    }),),

    new Overlay('overlay-footpath', 'Footpath (GPX)', () => new VectorSource({
        data: 'https://3d.oslandia.com/lyon/track.gpx',
        dataProjection: 'EPSG:4326',
        format: new format.GPX(),
        style: new Style({
            stroke: new Stroke({
                color: '#FA8C22',
                width: 2,
            }),
        }),
    }),),

    new Overlay('overlay-systral', 'Sytral lines (KML)', () => new VectorSource({
        data: 'https://3d.oslandia.com/lyon/tcl_sytral.tcllignemf_2_0_0.kml',
        format: new format.KML(),
        dataProjection: 'EPSG:4326',
        style: new Style({
            stroke: new Stroke({
                color: '#FA8C22',
                width: 2,
            }),
        }),
    }),),

    new Overlay('overlay-canopee', 'Canopée (GeoJSON)', () => new VectorSource({
        data: 'https://3d.oslandia.com/lyon/evg_esp_veg.evgparcindiccanope_latest.geojson',
        format: new format.GeoJSON(),
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

function getOverlays() {
    return overlays;
}

let overlayController: OverlayController;

MainController.onInit(ctrl => {
    overlayController = new OverlayController(ctrl);
});

class OverlayController {
    private readonly layerManager: LayerManager;
    private readonly layers: Map<string, ColorLayer> = new Map();

    constructor(mainController: MainController) {
        this.layerManager = mainController.layerManager;
        const extent = this.layerManager.extent;

        for (const overlay of overlays) {
            if (overlay.source) {
                const layer = new ColorLayer(overlay.name, { source: overlay.source(mainController.mainInstance) })
                this.layers.set(overlay.id, layer);
                this.layerManager.addOverlay(layer);
                layer.visible = overlay.visible;
                layer.opacity = overlay.opacity;

                overlay.addEventListener('opacity', () => this.onOpacityChanged(overlay));
                overlay.addEventListener('visible', () => this.onVisibilityChanged(overlay));
                overlay.addEventListener('up', () => this.onMoveUp(overlay));
                overlay.addEventListener('down', () => this.onMoveDown(overlay));
            }
        }
    }

    onMoveUp(overlay: Overlay) {
        const index = overlays.indexOf(overlay);

        if (index > 0) {
            const current = overlays[index - 1];
            overlays[index - 1] = overlay;
            overlays[index] = current;
            this.layerManager.moveOverlayUp(this.layers.get(overlay.id));
        }
    }

    onMoveDown(overlay: Overlay) {
        const index = overlays.indexOf(overlay);

        if (index < overlays.length - 2) {
            const current = overlays[index + 1];
            overlays[index + 1] = overlay;
            overlays[index] = current;
            this.layerManager.moveOverlayDown(this.layers.get(overlay.id));
        }
    }

    onOpacityChanged(overlay: Overlay) {
        const id = overlay.id;
        const layer = this.layers.get(id);
        layer.opacity = overlay.opacity;
        this.layerManager.notify(layer);
    }

    onVisibilityChanged(overlay: Overlay) {
        const id = overlay.id;
        const layer = this.layers.get(id);
        layer.visible = overlay.visible;
        this.layerManager.notify(layer);
    }
}

export default {
    getOverlays,
}