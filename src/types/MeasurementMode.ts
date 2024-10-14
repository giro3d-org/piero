import type Named from './Named';

type MeasurementMode = 'laser';

type MeasurementNamed = Named & {
    value: MeasurementMode;
};

export const measurementModes: MeasurementNamed[] = [
    {
        name: 'Laser',
        value: 'laser',
        description:
            'Will automatically beam perpendicularly to the selected point until a geometry is hit',
    },
] as const;

export default MeasurementMode;
