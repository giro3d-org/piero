import { type Color, type Vector3 } from 'three';

type Link = {
    href: string;
    title: string;
    type?: string;
};

export const isObject = (obj: unknown): obj is object => obj != null && typeof obj === 'object';

export const isLink = (obj: unknown): obj is Link => isObject(obj) && 'href' in obj;
export const isColor = (obj: unknown): obj is Color => isObject(obj) && (obj as Color).isColor;
export const isVector3 = (obj: unknown): obj is Vector3 =>
    isObject(obj) && (obj as Vector3).isVector3;
