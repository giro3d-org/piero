import type { FeatureLike } from 'ol/Feature';
import { Fill, RegularShape, Stroke, Style, Text } from 'ol/style';

const styles = {
    mask: new Style({
        fill: new Fill({ color: 'white' }),
    }),
    canopee: (feature: FeatureLike): Style =>
        new Style({
            fill: new Fill({
                color: `rgba(0, 128, 0, ${feature.get('indiccanop')})`,
            }),
            stroke: new Stroke({
                color: 'white',
            }),
        }),
    river: (feature: FeatureLike, resolution: number): Style[] => {
        const widthFromClass =
            (feature.get('classe') as string | undefined) != null
                ? 10 - parseInt(feature.get('classe'), 10)
                : 3;
        return [
            new Style({
                stroke: new Stroke({
                    color: '#3030FF',
                    width: (widthFromClass * 5) / resolution,
                }),
            }),
            new Style({
                text: new Text({
                    text: feature.get('nomentiteh'),
                    fill: new Fill({
                        color: '#ffffff',
                    }),
                    placement: 'line',
                    overflow: true,
                }),
            }),
        ];
    },
    fountain: (feature: FeatureLike, resolution: number): Style => {
        const meters = 1 / resolution; // Assuming pixel ratio is 1
        // We want to display a 5*5m square, except
        // for when we're too far away, use a 2*2px square
        const size = Math.max(5 * meters, 2);
        return new Style({
            image: new RegularShape({
                radius: size,
                points: 4,
                stroke: new Stroke({
                    width: 1,
                    color: [255, 255, 255, 1],
                }),
                fill: new Fill({
                    color: [0, 0, 128, 1],
                }),
            }),
        });
    },
};

export type DynamicStyleId = keyof typeof styles;

export default styles;
