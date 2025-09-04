import type Named from './Named';

type AnnotationMode = 'normal' | 'mapOnly' | 'objectsOnly';

type AnnotationNamed = Named & {
    value: AnnotationMode;
};

export const annotationModes: AnnotationNamed[] = [
    { name: 'Default', value: 'normal' },
    {
        name: 'Map only',
        value: 'mapOnly',
        description: 'Will only pick points from the map and not to any 3D object',
    },
    {
        name: '3D objects only',
        value: 'objectsOnly',
        description: 'Will only pick points from 3D objects, and not from the map',
    },
] as const;

export default AnnotationMode;
