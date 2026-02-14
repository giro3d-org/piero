import z from 'zod';

import { Coordinate } from './coordinate';

export type AnnotationType = 'linestring' | 'multipoint' | 'point' | 'polygon';
export const AnnotationTypeSchema: z.ZodType<AnnotationType> = z.union([
    z.literal('point'),
    z.literal('multipoint'),
    z.literal('polygon'),
    z.literal('linestring'),
]);
z.globalRegistry.add(AnnotationTypeSchema, { id: 'AnnotationType' });

export interface AnnotationBase {
    /** Name of the annotation displayed in the UI */
    title: string;
    type: AnnotationType;
}
export const AnnotationBaseSchema = z.object({
    title: z.string().nonempty(),
    type: AnnotationTypeSchema,
});
const __AnnotationBaseTypeCheck: AnnotationBase = {} as z.infer<typeof AnnotationBaseSchema>;
z.globalRegistry.add(AnnotationBaseSchema, { id: 'AnnotationBase' });

export interface PointAnnotation extends AnnotationBase {
    coordinate: Coordinate;
    type: 'point';
}
export const PointAnnotation = AnnotationBaseSchema.extend({
    coordinate: Coordinate,
    type: z.literal('point'),
});
const __PointAnnotationTypeCheck: PointAnnotation = {} as z.infer<typeof PointAnnotation>;
z.globalRegistry.add(PointAnnotation, { id: 'PointAnnotation' });

export type Annotation = PointAnnotation;
export const Annotation: z.ZodType<Annotation> = z.union([PointAnnotation]);
z.globalRegistry.add(Annotation, { id: 'Annotation' });
