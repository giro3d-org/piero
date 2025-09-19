import type { Component } from 'vue';

import { hasExperimentalFeature } from '@/utils/Configuration';

type PanelDef = {
    enabled: boolean;
    icon: string;
    key: PanelType;
    title: string;
};

export type PanelType =
    | 'about'
    | 'analysis'
    | 'annotations'
    | 'bookmarks'
    | 'datasets'
    | 'measures';

let panels: PanelDef[] | null = null;

type DatasetType = string;

export default function getPanels(): ReadonlyArray<PanelDef> {
    if (!panels) {
        panels = [
            { enabled: true, icon: 'bi-database', key: 'datasets', title: 'Datasets' },
            { enabled: true, icon: 'bi-vector-pen', key: 'annotations', title: 'Annotations' },
            {
                enabled: hasExperimentalFeature('measurements'),
                icon: 'bi-rulers',
                key: 'measures',
                title: 'Measurements',
            },
            { enabled: true, icon: 'bi-graph-up', key: 'analysis', title: 'Analysis' },
            { enabled: true, icon: 'bi-bookmarks', key: 'bookmarks', title: 'Bookmarks' },
            { enabled: true, icon: 'bi-info-circle', key: 'about', title: 'About Piero' },
        ] as const;
    }
    return panels;
}

export const propertyViews: Map<DatasetType, Component> = new Map();

export const datasetIcons: Record<DatasetType, string> = {
    colorLayer: 'fg-landcover-map',
    elevationLayer: 'fg-contour-map',
    featureCollection: 'bi-buildings',
    maskLayer: 'fg-hex-map',
    pointcloud: 'fg-multipoint',
    tiledIfc: 'bi-building',
    vector: 'fg-polygon-pt',
};

export const datasetTitles: Record<DatasetType, string> = {
    colorLayer: 'Color Layer',
    elevationLayer: 'Elevation layer',
    featureCollection: 'Feature Collection',
    maskLayer: 'Mask Layer',
    pointcloud: 'Point Cloud',
    tiledIfc: 'IFC',
    vector: 'Vector',
};
