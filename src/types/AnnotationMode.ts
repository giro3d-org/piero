import Named from "./Named";

type AnnotationMode = 'normal' | 'snapToMap' | 'snapToFeatures' | 'snapToSameFeature';

export const annotationModes: Named[] = [
    { name: 'Default', value: 'normal' },
    { name: 'Snap to map', value: 'snapToMap' },
    { name: 'Snap to features', value: 'snapToFeatures' },
    { name: 'Snap on same feature', value: 'snapToSameFeature'},
] as const;

export default AnnotationMode;
