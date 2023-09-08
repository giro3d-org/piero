import { defineStore } from "pinia";
import { Ref, computed, reactive, ref } from "vue";
import { BasemapObject, Basemap } from "../types/Basemap";
import Instance from "@giro3d/giro3d/core/Instance";
import { Overlay, OverlayObject } from "@/types/Overlay";

import * as olsource from 'ol/source';
import * as olstyle from 'ol/style';
import * as format from 'ol/format';
import GML32 from 'ol/format/GML32';
import TiledImageSource from "@giro3d/giro3d/sources/TiledImageSource";
import VectorSource from "@giro3d/giro3d/sources/VectorSource";

const basemapList = [
    new BasemapObject({ id: 'osm', name: 'OSM', type: 'color', visible: false }),
    new BasemapObject({ id: 'imagery', name: 'Imagery' }),
    new BasemapObject({ id: 'elevation', name: 'Elevation', type: 'elevation' }),
];

const overlayList = [
    new OverlayObject('overlay-arbres', 'Alignement d\'arbres', (instance: Instance) => new TiledImageSource({
        source: new olsource.TileWMS({
            url: 'https://download.data.grandlyon.com/wms/grandlyon',
            projection: instance.referenceCrs,
            params: {
                LAYERS: ['metropole-de-lyon:abr_arbres_alignement.abrarbre'],
                FORMAT: 'image/png',
                VERSION: '1.3.0',
            },
        }),
    })),

    new OverlayObject('overlay-travaux', 'Prévision de travaux de la Métropole de Lyon', (instance: Instance) => new TiledImageSource({
        source: new olsource.TileWMS({
            url: 'https://download.data.grandlyon.com/wms/rdata',
            projection: instance.referenceCrs,
            params: {
                LAYERS: ['lyv_lyvia.lyvchantier'],
                FORMAT: 'image/png',
                VERSION: '1.3.0',
            },
        }),
    })),

    new OverlayObject('overlay-zae', 'Zones d\'activités économiques (ZAE)', (instance: Instance) => new TiledImageSource({
        source: new olsource.TileWMS({
            url: 'https://download.data.grandlyon.com/wms/grandlyon',
            projection: instance.referenceCrs,
            params: {
                LAYERS: ['adr_voie_lieu.adrzae'],
                FORMAT: 'image/png',
                VERSION: '1.3.0',
            },
        }),
    })),

    new OverlayObject('overlay-vegetation', 'Végétation stratifiée 2018', (instance: Instance) => new TiledImageSource({
        source: new olsource.TileWMS({
            url: 'https://download.data.grandlyon.com/wms/rdata',
            projection: instance.referenceCrs,
            params: {
                LAYERS: ['MNC_class_2022_INT1U'],
                FORMAT: 'image/png',
                VERSION: '1.3.0',
            },
        }),
    })),

    new OverlayObject('overlay-fibre', 'Réseau fibre', (instance: Instance) => new TiledImageSource({
        source: new olsource.TileWMS({
            url: 'https://download.data.grandlyon.com/wms/rdata',
            projection: instance.referenceCrs,
            params: {
                LAYERS: ['tel_telecom.telfibreripthd_1'],
                FORMAT: 'image/png',
                VERSION: '1.3.0',
            },
        }),
    })),

    new OverlayObject('overlay-fontaines', 'Fontaines (GML)', () => new VectorSource({
        data: 'https://3d.oslandia.com/lyon/adr_voie_lieu.adrbornefontaine_latest.gml',
        dataProjection: 'EPSG:4171',
        format: new GML32(),
        style: (feature, resolution) => new olstyle.Style({
            // Adapt size to resolution, so the shape takes approximately
            // always the same size, and in meters :)
            // This assumes pixelRatio of resolution is 1 and that the CRS
            // is in meters.
            // If true, 10 / resolution corresponds to 10 meters
            image: new olstyle.RegularShape({
                // Radius of 5m
                radius: 2.5 / resolution,
                points: 4,
                stroke: new olstyle.Stroke({
                    width: 2 / resolution,
                    color: [255, 255, 255, 1],
                }),
                fill: new olstyle.Fill({
                    color: [0, 150, 255, 1],
                }),
            }),
        }),
    }),),

    new OverlayObject('overlay-footpath', 'Footpath (GPX)', () => new VectorSource({
        data: 'https://3d.oslandia.com/lyon/track.gpx',
        dataProjection: 'EPSG:4326',
        format: new format.GPX(),
        style: new olstyle.Style({
            stroke: new olstyle.Stroke({
                color: '#FA8C22',
                width: 2,
            }),
        }),
    }),),

    new OverlayObject('overlay-systral', 'Sytral lines (KML)', () => new VectorSource({
        data: 'https://3d.oslandia.com/lyon/tcl_sytral.tcllignemf_2_0_0.kml',
        format: new format.KML(),
        dataProjection: 'EPSG:4326',
        style: new olstyle.Style({
            stroke: new olstyle.Stroke({
                color: '#FA8C22',
                width: 2,
            }),
        }),
    }),),

    new OverlayObject('overlay-canopee', 'Canopée (GeoJSON)', () => new VectorSource({
        data: 'https://3d.oslandia.com/lyon/evg_esp_veg.evgparcindiccanope_latest.geojson',
        format: new format.GeoJSON(),
        dataProjection: 'EPSG:4171',
        style: feature => new olstyle.Style({
            fill: new olstyle.Fill({
                color: `rgba(0, 128, 0, ${feature.get('indiccanop')})`,
            }),
            stroke: new olstyle.Stroke({
                color: 'white',
            }),
        }),
    }),),
];

export const useLayerStore = defineStore('layers', () => {
    const basemaps = reactive(basemapList);
    const basemapCount = computed(() => basemaps.length);

    const overlays: Overlay[] = reactive(overlayList);
    const overlayCount = computed(() => overlays.length);

    function getBasemaps(): Basemap[] {
        return basemaps;
    }

    function setBasemapVisibility(layer: Basemap, visible: boolean) {
        layer.visible = visible;
    }

    function setBasemapOpacity(layer: Basemap, opacity: number) {
        layer.opacity = opacity;
    }

    function getOverlays(): Overlay[] {
        return overlays;
    }

    function setOverlayVisibility(layer: Overlay, visible: boolean) {
        layer.visible = visible;
    }

    function setOverlayOpacity(layer: Overlay, opacity: number) {
        layer.opacity = opacity;
    }

    function moveOverlayUp(layer: Overlay) {
        const index = overlays.indexOf(layer);
        if (index > 0) {
            const current = overlays[index - 1];
            overlays[index - 1] = layer;
            overlays[index] = current;
        }
    }

    function moveOverlayDown(layer: Overlay) {
        const index = overlays.indexOf(layer);

        if (index < overlays.length - 1) {
            const current = overlays[index + 1];
            overlays[index + 1] = layer;
            overlays[index] = current;
        }
    }

    return {
        basemapCount,
        getBasemaps,
        setBasemapOpacity,
        setBasemapVisibility,
        overlayCount,
        getOverlays,
        setOverlayOpacity,
        setOverlayVisibility,
        moveOverlayUp,
        moveOverlayDown,
    }
});