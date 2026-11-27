import type geojson from 'geojson';

import z from 'zod';

import { LookAt } from './lookAt';

export interface Bookmark {
    /** The camera position */
    lookAt: LookAt;
    /** Name of the bookmark displayed in the UI */
    title: string;
}

export const Bookmark: z.ZodType<Bookmark> = z.object({
    /** The camera position */
    lookAt: LookAt,
    /** Name of the bookmark displayed in the UI */
    title: z.string().nonempty(),
});

z.globalRegistry.add(Bookmark, { id: 'Bookmark' });

export function fromGeojsonFeature(feature: geojson.Feature): Bookmark {
    const { heading, name, tilt } = feature.properties as {
        heading: number;
        name: string;
        tilt: number;
    };
    const geometry = feature.geometry as geojson.Point;
    const [longitude, latitude, altitude] = geometry.coordinates;

    return {
        lookAt: {
            altitude,
            heading,
            latitude,
            longitude,
            tilt,
        },
        title: name,
    };
}

export function toGeojsonFeature(bookmark: Bookmark): geojson.Feature {
    const { altitude, heading, latitude, longitude, tilt } = bookmark.lookAt;

    return {
        geometry: {
            coordinates: [longitude, latitude, altitude],
            type: 'Point',
        },
        properties: {
            heading,
            name: bookmark.title,
            tilt,
        },
        type: 'Feature',
    };
}
