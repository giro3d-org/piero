import type { Component } from 'vue';

type DatasetType = string;

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
