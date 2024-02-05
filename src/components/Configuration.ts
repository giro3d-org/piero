import config from '../config';

type PanelDef = {
    key: string,
    title: string,
    icon: string,
    enabled: boolean,
}

const panels: PanelDef[] = [
    { key: 'layers', title: 'Layers', icon: 'bi-layers', enabled: true, },
    { key: 'datasets', title: 'Datasets', icon: 'bi-database', enabled: true, },
    { key: 'annotations', title: 'Annotations', icon: 'bi-vector-pen', enabled: true, },
    { key: 'measures', title: 'Measurements', icon: 'bi-rulers', enabled: config.enabled_features?.includes("measurements") ?? false },
    { key: 'analysis', title: 'Analysis', icon: 'bi-graph-up', enabled: true, },
    { key: 'bookmarks', title: 'Bookmarks', icon: 'bi-bookmarks', enabled: true, },
    { key: 'about', title: 'About', icon: 'bi-info-circle', enabled: true, }
] as const;

export type PanelType = typeof panels[number]['key'];

export default {
  panels
}
