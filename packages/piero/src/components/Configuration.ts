import { hasExperimentalFeature } from '@/utils/Configuration';
import type { Component } from 'vue';

export type PanelType =
    | 'datasets'
    | 'annotations'
    | 'measures'
    | 'analysis'
    | 'bookmarks'
    | 'about';

type PanelDef = {
    key: PanelType;
    title: string;
    icon: string;
    enabled: boolean;
};

let panels: PanelDef[] | null = null;

export default function getPanels(): ReadonlyArray<PanelDef> {
    if (!panels) {
        panels = [
            { key: 'datasets', title: 'Datasets', icon: 'bi-database', enabled: true },
            { key: 'annotations', title: 'Annotations', icon: 'bi-vector-pen', enabled: true },
            {
                key: 'measures',
                title: 'Measurements',
                icon: 'bi-rulers',
                enabled: hasExperimentalFeature('measurements'),
            },
            { key: 'analysis', title: 'Analysis', icon: 'bi-graph-up', enabled: true },
            { key: 'bookmarks', title: 'Bookmarks', icon: 'bi-bookmarks', enabled: true },
            { key: 'about', title: 'About Piero', icon: 'bi-info-circle', enabled: true },
        ] as const;
    }
    return panels;
}

type DatasetType = string;

export const propertyViews: Map<DatasetType, Component> = new Map();

export const datasetIcons: Record<DatasetType, string> = {
    featureCollection: 'bi-buildings',
    colorLayer: 'fg-landcover-map',
    elevationLayer: 'fg-contour-map',
    maskLayer: 'fg-hex-map',
    pointcloud: 'fg-multipoint',
    tiledIfc: 'bi-building',
    vector: 'fg-polygon-pt',
};

export const datasetTitles: Record<DatasetType, string> = {
    featureCollection: 'Feature Collection',
    colorLayer: 'Color Layer',
    elevationLayer: 'Elevation layer',
    maskLayer: 'Mask Layer',
    pointcloud: 'Point Cloud',
    tiledIfc: 'IFC',
    vector: 'Vector',
};
