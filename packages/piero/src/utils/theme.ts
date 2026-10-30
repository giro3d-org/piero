import chroma from 'chroma-js';
import { type ColorRepresentation } from 'three';

export interface ColorScheme {
    primary: ColorRepresentation;
    primaryDark: ColorRepresentation;
    primaryLight: ColorRepresentation;
}

export function getColorScheme(): ColorScheme {
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--bs-primary');

    const [h, s, l] = chroma(primary).hsl();

    const primaryLight = chroma.hsl(h, s, l * 1.4).hex();
    const primaryDark = chroma.hsl(h, s * 0.9, l * 0.7).hex();

    return {
        primary,
        primaryDark,
        primaryLight,
    };
}
