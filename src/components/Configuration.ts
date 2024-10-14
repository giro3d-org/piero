import { hasExperimentalFeature } from '@/utils/Configuration';

type PanelDef = {
    key: string;
    title: string;
    icon: string;
    enabled: boolean;
};

const panels: PanelDef[] = [
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

export type PanelType = (typeof panels)[number]['key'];

export default {
    panels,
};
