import type Named from './Named';

type MeasurementMode = 'laser';

type MeasurementNamed = Named & {
    value: MeasurementMode;
};

export const measurementModes: MeasurementNamed[] = [
    {
        description:
            'Will automatically beam perpendicularly to the selected point until a geometry is hit',
        name: 'Laser',
        value: 'laser',
    },
] as const;

export default MeasurementMode;
