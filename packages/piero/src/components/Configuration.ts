import { hasExperimentalFeature } from '@/utils/Configuration';

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
