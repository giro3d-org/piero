import Named from "./Named";

type AnnotationMode = 'normal' | 'snapToMap' | 'snapToFeatures' | 'snapToSameFeature';

type AnnotationNamed = Named & {
    value: AnnotationMode;
}

export const annotationModes: AnnotationNamed[] = [
    { name: 'Default', value: 'normal' },
    { name: 'Snap to map', value: 'snapToMap', description: 'Will only pick points from the map and not to any 3D object' },
    { name: 'Snap to features', value: 'snapToFeatures', description: 'Will only pick points from 3D objects, and not from the map' },
    { name: 'Snap on same feature', value: 'snapToSameFeature', description: 'Will only pick points from 3D objects for the first one. Once a point is picked, will pick only on the same object.' },
] as const;

export default AnnotationMode;
