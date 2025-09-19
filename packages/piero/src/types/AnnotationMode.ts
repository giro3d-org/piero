import type Named from './Named';

type AnnotationMode = 'mapOnly' | 'normal' | 'objectsOnly';

type AnnotationNamed = Named & {
    value: AnnotationMode;
};

export const annotationModes: AnnotationNamed[] = [
    { name: 'Default', value: 'normal' },
    {
        description: 'Will only pick points from the map and not to any 3D object',
        name: 'Map only',
        value: 'mapOnly',
    },
    {
        description: 'Will only pick points from 3D objects, and not from the map',
        name: '3D objects only',
        value: 'objectsOnly',
    },
] as const;

export default AnnotationMode;
