import z from 'zod';

import { Coordinate } from './coordinate';

export const AnnotationType = z.union([
    z.literal('point'),
    z.literal('multipoint'),
    z.literal('polygon'),
    z.literal('linestring'),
]);
export type AnnotationType = z.infer<typeof AnnotationType>;
z.globalRegistry.add(AnnotationType, { id: 'AnnotationType' });

export const AnnotationBase = z.object({
    /** Name of the annotation displayed in the UI */
    title: z.string().nonempty(),
    type: AnnotationType,
});
export type AnnotationBase = z.infer<typeof AnnotationBase>;
z.globalRegistry.add(AnnotationBase, { id: 'AnnotationBase' });

export const PointAnnotation = AnnotationBase.extend({
    coordinate: Coordinate,
    type: z.literal('point'),
});
z.globalRegistry.add(PointAnnotation, { id: 'PointAnnotation' });

export const Annotation = z.union([PointAnnotation]);
export type Annotation = z.infer<typeof Annotation>;
z.globalRegistry.add(Annotation, { id: 'Annotation' });
