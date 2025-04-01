import GML32 from 'ol/format/GML32.js';
import { Color } from 'three';
import type { Configuration } from './types/Configuration';

const config: Configuration = {
    crs_definitions: {
        'EPSG:2154': '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
        'EPSG:3857': '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs',
        'EPSG:3946': '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        'EPSG:3948': '+proj=lcc +lat_0=48 +lon_0=3 +lat_1=47.25 +lat_2=48.75 +x_0=1700000 +y_0=7200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
        'EPSG:4171': '+proj=longlat +ellps=GRS80 +no_defs +type=crs',
        'EPSG:4326': '+proj=longlat +datum=WGS84 +no_defs +type=crs',
        'IGNF:WGS84G': 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]',
    },
    default_crs: 'EPSG:2154',
    // Switch-on experimental features
    enabled_features: ['measurements'],
    camera: {
        position: {
            crs: 'EPSG:2154',
            x: 842022,
            y: 6516602,
            z: 725,
        },
        lookAt: {
            crs: 'EPSG:2154',
            x: 841869,
            y: 6518359,
            z: -100,
        },
    },
    basemap: {
        extent: {
            crs: 'EPSG:2154',
            west: -111629.52,
            east: 1275028.84,
            south: 5976033.79,
            north: 7230161.64,
        },
        colormap: {
            min: 0,
            max: 90,
            ramp: 'Greys',
            mode: 2,
        },
        graticule: {
            enabled: false,
            color: new Color('white'),
            xStep: 1000,
            yStep: 1000,
            thickness: 10,
        },
        layers: [
            {
                type: 'color',
                name: 'OpenStreetMap',
                visible: false,
                source: {
                    type: 'osm',
                },
            },
            {
                type: 'color',
                name: 'Plan IGN',
                visible: false,
                source: {
                    type: 'wmts',
                    layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
                    format: 'image/png',
                    url: 'https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
                },
            },
            {
                type: 'color',
                name: 'Orthophotos IGN',
                visible: true,
                source: {
                    type: 'wmts',
                    layer: 'ORTHOIMAGERY.ORTHOPHOTOS',
                    format: 'image/jpeg',
                    projection: 'EPSG:3857',
                    url: 'https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
                    retries: 0,
                },
            },
            {
                type: 'mask',
                name: 'Mask Lyon boundary',
                visible: false,
                source: {
                    type: 'geojson',
                    projection: 'EPSG:2154',
                    url: 'https://data.grandlyon.com/geoserver/metropole-de-lyon/ows?SERVICE=WFS&VERSION=2.0.0&request=GetFeature&typename=metropole-de-lyon:adr_voie_lieu.adrcomgl_2024&outputFormat=application/json&SRSNAME=EPSG:2154&CQL_FILTER=insee=69123&startIndex=0&sortBy=gid&count=100',
                    style: 'mask',
                },
            },
            {
                type: 'elevation',
                name: 'IGN Elevation',
                visible: true,
                source: {
                    type: 'wmts',
                    resolution: 0.5,
                    layer: 'ELEVATION.ELEVATIONGRIDCOVERAGE',
                    format: 'image/x-bil;bits=32',
                    url: 'https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
                    nodata: -1000,
                },
            },
            {
                type: 'elevation',
                name: 'Mapbox Elevation',
                visible: false,
                source: {
                    type: 'xyz',
                    imageFormat: 'MapboxTerrain',
                    url: 'https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=pk.eyJ1IjoidG11Z3VldCIsImEiOiJjbGJ4dTNkOW0wYWx4M25ybWZ5YnpicHV6In0.KhDJ7W5N3d1z3ArrsDjX_A',
                },
            },
        ],
    },
    pointcloud: {
        min: 160,
        max: 300,
        ramp: 'Viridis',
    },
    analysis: {
        cross_section: {
            pivot: {
                crs: 'EPSG:2154',
                x: 841913,
                y: 6517811,
            },
            orientation: 40,
        },
        clipping_box: {
            center: {
                crs: 'EPSG:2154',
                x: 841906,
                y: 6517811,
                z: 166,
            },
            size: {
                x: 20,
                y: 20,
                z: 20,
            },
            floor_preset: {
                altitude: 167,
                size: 2.8,
                floor: 0,
            },
        },
    },
    datasets: [
        {
            name: 'Fountains (GML)',
            type: 'vector',
            rendering: 'label',
            text: feature => {
                return feature.get('gid');
            },
            source: {
                type: 'ol',
                format: new GML32(),
                dataProjection: 'EPSG:4171',
                url: 'https://3d.oslandia.com/lyon/adr_voie_lieu.adrbornefontaine_latest.gml',
                fetchElevation: true,
            },
        },
        {
            name: 'Footpath (GPX)',
            type: 'vector',
            rendering: 'shape',
            source: {
                dataProjection: 'EPSG:4326',
                url: 'https://3d.oslandia.com/lyon/track.gpx',
                type: 'gpx',
            },
        },
        {
            name: "Cours d'eau",
            visible: false,
            type: 'maskLayer',
            source: {
                type: 'mvt',
                url: 'https://3d.oslandia.com/cp4sc/pg_tileserv/public.courseau/{z}/{x}/{y}.pbf',
                style: 'river',
            },
        },
        {
            name: 'Réseau fibre',
            visible: false,
            type: 'colorLayer',
            source: {
                type: 'wms',
                projection: 'EPSG:2154',
                layer: 'tel_telecom.telfibreripthd_1',
                format: 'image/png',
                url: 'https://download.data.grandlyon.com/wms/rdata',
            },
        },
        {
            name: 'Sytral lines (KML) as layer',
            visible: false,
            type: 'colorLayer',
            source: {
                type: 'kml',
                projection: 'EPSG:4326',
                url: 'https://3d.oslandia.com/lyon/tcl_sytral.tcllignemf_2_0_0.kml',
                style: {
                    stroke: {
                        color: '#FA8C22',
                        width: 2,
                    },
                },
            },
        },
        {
            name: 'Sytral lines (KML) as mesh',
            type: 'vector',
            rendering: 'mesh',
            source: {
                type: 'kml',
                dataProjection: 'EPSG:4326',
                url: 'https://3d.oslandia.com/lyon/tcl_sytral.tcllignemf_2_0_0.kml',
                fetchElevation: true,
                fetchElevationFast: false,
            },
        },
        {
            name: 'Canopée (GeoJSON)',
            visible: false,
            type: 'colorLayer',
            source: {
                projection: 'EPSG:4171',
                url: 'https://3d.oslandia.com/lyon/evg_esp_veg.evgparcindiccanope_latest.geojson',
                type: 'geojson',
                style: 'canopee',
            },
        },
        {
            name: 'COG',
            visible: false,
            type: 'colorLayer',
            source: {
                type: 'cog',
                url: 'https://3d.oslandia.com/lyon/TS2015.tif',
                projection: 'EPSG:3946',
            },
        },
        {
            type: 'ifc',
            name: '19_rue_Marc_Antoine_Petit (IFC)',
            source: {
                url: 'https://3d.oslandia.com/lyon/19_rue_Marc_Antoine_Petit.ifc',
                position: {
                    crs: 'EPSG:2154',
                    x: 841913,
                    y: 6517805,
                    z: 170,
                },
            },
        },
        {
            type: 'tiledIfc',
            name: '19_rue_Marc_Antoine_Petit (3D Tiles)',
            source: {
                url: 'https://3d.oslandia.com/3dtiles/19_rue_Marc_Antoine_Petit_ifc/tileset.json',
            },
        },
        {
            type: 'featureCollection',
            name: 'BD TOPO',
            source: 'bdtopo',
        },
        {
            type: 'group',
            name: 'CityJSON',
            children: [
                {
                    type: 'cityjson',
                    source: {
                        url: 'https://3d.oslandia.com/lyon/Semis_2021_0841_6520_LA93_IGN69.city.json',
                    },
                    name: 'Semis_2021_0841_6520_LA93_IGN69',
                },
                {
                    type: 'cityjson',
                    source: {
                        url: 'https://3d.oslandia.com/lyon/Semis_2021_0841_6521_LA93_IGN69.city.json',
                    },
                    name: 'Semis_2021_0841_6521_LA93_IGN69',
                },
                {
                    type: 'cityjson',
                    source: {
                        url: 'https://3d.oslandia.com/lyon/Semis_2021_0842_6520_LA93_IGN69.city.json',
                    },
                    name: 'Semis_2021_0842_6520_LA93_IGN69',
                },
                {
                    type: 'cityjson',
                    source: {
                        url: 'https://3d.oslandia.com/lyon/Semis_2021_0842_6521_LA93_IGN69.city.json',
                    },
                    name: 'Semis_2021_0842_6521_LA93_IGN69',
                },
            ],
        },
        {
            type: 'group',
            name: 'PointCloud',
            canMaskBasemap: true,
            children: [
                {
                    type: 'pointcloud',
                    source: {
                        url: 'https://3d.oslandia.com/lyon/3dtiles/Semis_2021_0841_6520_LA93_IGN69/tileset.json',
                    },
                    name: 'Semis_2021_0841_6520_LA93_IGN69',
                },
                {
                    type: 'pointcloud',
                    source: {
                        url: 'https://3d.oslandia.com/lyon/3dtiles/Semis_2021_0841_6521_LA93_IGN69/tileset.json',
                    },
                    name: 'Semis_2021_0841_6521_LA93_IGN69',
                },
                {
                    type: 'pointcloud',
                    source: {
                        url: 'https://3d.oslandia.com/lyon/3dtiles/Semis_2021_0842_6520_LA93_IGN69/tileset.json',
                    },
                    name: 'Semis_2021_0842_6520_LA93_IGN69',
                },
                {
                    type: 'pointcloud',
                    source: {
                        url: 'https://3d.oslandia.com/lyon/3dtiles/Semis_2021_0842_6521_LA93_IGN69/tileset.json',
                    },
                    name: 'Semis_2021_0842_6521_LA93_IGN69',
                },
            ],
        },
    ],
    importedVectorDatasetRendering: 'overlay',
    overlays: [
        {
            name: "Cours d'eau",
            visible: false,
            source: {
                type: 'mvt',
                url: 'https://3d.oslandia.com/cp4sc/pg_tileserv/public.courseau/{z}/{x}/{y}.pbf',
                style: 'river',
            },
        },
        {
            name: 'Réseau fibre',
            visible: false,
            source: {
                type: 'wms',
                projection: 'EPSG:2154',
                layer: 'tel_telecom.telfibreripthd_1',
                format: 'image/png',
                url: 'https://download.data.grandlyon.com/wms/rdata',
            },
        },
        {
            name: 'Végétation stratifiée 2018',
            visible: false,
            source: {
                type: 'wms',
                projection: 'EPSG:2154',
                layer: 'MNC_class_2022_INT1U',
                format: 'image/png',
                url: 'https://download.data.grandlyon.com/wms/rdata',
            },
        },
        {
            name: "Zones d'activités économiques (ZAE)",
            visible: false,
            source: {
                type: 'wms',
                projection: 'EPSG:2154',
                layer: 'adr_voie_lieu.adrzae',
                format: 'image/png',
                url: 'https://download.data.grandlyon.com/wms/grandlyon',
            },
        },
        {
            name: 'Prévision de travaux de la Métropole de Lyon',
            visible: false,
            source: {
                type: 'wms',
                projection: 'EPSG:2154',
                layer: 'lyv_lyvia.lyvchantier',
                format: 'image/png',
                url: 'https://download.data.grandlyon.com/wms/rdata',
            },
        },
        {
            name: "Alignement d'arbres",
            visible: false,
            source: {
                type: 'wms',
                projection: 'EPSG:2154',
                layer: 'metropole-de-lyon:abr_arbres_alignement.abrarbre',
                format: 'image/png',
                url: 'https://download.data.grandlyon.com/wms/grandlyon',
            },
        },
        {
            name: 'Sytral lines (KML)',
            visible: false,
            source: {
                type: 'kml',
                projection: 'EPSG:4326',
                url: 'https://3d.oslandia.com/lyon/tcl_sytral.tcllignemf_2_0_0.kml',
                style: {
                    stroke: {
                        color: '#FA8C22',
                        width: 2,
                    },
                },
            },
        },
        {
            name: 'Footpath (GPX)',
            visible: false,
            source: {
                projection: 'EPSG:4326',
                url: 'https://3d.oslandia.com/lyon/track.gpx',
                type: 'gpx',
                style: {
                    stroke: {
                        color: '#FA8C22',
                        width: 2,
                    },
                },
            },
        },
        {
            name: 'Canopée (GeoJSON)',
            visible: false,
            source: {
                projection: 'EPSG:4171',
                url: 'https://3d.oslandia.com/lyon/evg_esp_veg.evgparcindiccanope_latest.geojson',
                type: 'geojson',
                style: 'canopee',
            },
        },
        {
            name: 'Fountains (GML)',
            visible: false,
            source: {
                type: 'vector',
                format: new GML32(),
                projection: 'EPSG:4171',
                url: 'https://3d.oslandia.com/lyon/adr_voie_lieu.adrbornefontaine_latest.gml',
                style: 'fountain',
            },
        },
        {
            name: 'Surface temperature (COG)',
            visible: false,
            source: {
                type: 'cog',
                url: 'https://3d.oslandia.com/lyon/TS2015.tif',
                projection: 'EPSG:3946',
            },
        },
    ],
    bookmarks: [
        {
            title: 'Entrée du 19',
            position: {
                x: 841907.9,
                y: 6517787.6,
                z: 169.2,
            },
            target: {
                x: 841905.9,
                y: 6517796.4,
                z: 168.9,
            },
            focalOffset: {
                x: 0.1,
                y: -1.11,
                z: -0.0,
            },
        },
        {
            title: 'Dans le 19',
            position: {
                x: 841907.6,
                y: 6517804.2,
                z: 169.4,
            },
            target: {
                x: 841904.9,
                y: 6517800.2,
                z: 168.7,
            },
            focalOffset: {
                x: -0.3,
                y: 0.22,
                z: -0.01,
            },
        },
        {
            title: 'Vue sur le garage du 19',
            position: {
                x: 841860.4,
                y: 6517792.9,
                z: 191.21,
            },
            target: {
                x: 841901.2,
                y: 6517810.4,
                z: 169.8,
            },
            focalOffset: {
                x: 0.2,
                y: -3.6,
                z: -0.1,
            },
        },
        {
            title: 'Arrière du 19',
            position: {
                x: 841966.6,
                y: 6517864.2,
                z: 190.9,
            },
            target: {
                x: 841913.4,
                y: 6517812.32,
                z: 169.1,
            },
            focalOffset: {
                x: 2.0,
                y: -8.2,
                z: -0.4,
            },
        },
        {
            title: 'Fondations du 19',
            position: {
                x: 841871.8,
                y: 6517798.5,
                z: 155.6,
            },
            target: {
                x: 841901.7,
                y: 6517804.9,
                z: 165.52,
            },
            focalOffset: {
                x: 1.7,
                y: -0.1,
                z: -0.0,
            },
        },
        {
            title: 'Le 19 et ses environs',
            position: {
                x: 841744.9,
                y: 6517718.9,
                z: 283.6,
            },
            target: {
                x: 841901.61,
                y: 6517800.2,
                z: 179.1,
            },
            focalOffset: {
                x: 6.7,
                y: -19.8,
                z: -1.0,
            },
        },
        {
            title: 'Le 19 et le paysage',
            position: {
                x: 841969.4,
                y: 6517752.1,
                z: 203.3,
            },
            target: {
                x: 841866.8,
                y: 6517820.7,
                z: 185.5,
            },
            focalOffset: {
                x: 0.4,
                y: -7.2,
                z: -0.21,
            },
        },
        {
            title: 'Entrée du tunnel de Fourvière',
            position: {
                x: 842319.2,
                y: 6518423.6,
                z: 982.2,
            },
            target: {
                x: 841467.6,
                y: 6518689.5,
                z: 204.6,
            },
            focalOffset: {
                x: -133.0,
                y: 3.6,
                z: -7.5,
            },
        },
        {
            title: "Vue Gerland / presqu'île ZAE",
            position: {
                x: 843055.3,
                y: 6514043.62,
                z: 1742.61,
            },
            target: {
                x: 842330.1,
                y: 6516692.81,
                z: 165.21,
            },
            focalOffset: {
                x: -290.32,
                y: 64.6,
                z: -13.9,
            },
        },
        {
            title: 'Montée des eaux',
            position: {
                x: 842174.9,
                y: 6514276.1,
                z: 6860.9,
            },
            target: {
                x: 842286.9,
                y: 6518559.1,
                z: 133.9,
            },
            focalOffset: {
                x: -77.9,
                y: 165.71,
                z: -2.5,
            },
        },
    ],
};

export default config;
