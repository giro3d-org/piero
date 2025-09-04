import { DEFAULT_SHAPE_COLOR } from '@/constants';
import { fillObject3DUserData } from '@/loaders/userData';
import type { SimpleFeature, SimpleGeometryType } from '@/utils/OLFeatures';
import type PickOptions from '@giro3d/giro3d/core/picking/PickOptions';
import type PickResult from '@giro3d/giro3d/core/picking/PickResult';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import { getContrastColor } from '@giro3d/giro3d/utils/ColorUtils';
import type { Coordinate } from 'ol/coordinate';
import type { Intersection } from 'three';
import { Box3, Color, Group, MathUtils, Raycaster, Vector2, Vector3 } from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import type { VectorMeshSource } from './VectorMeshEntity';

const tmpNDC = new Vector2();
const thisColor = new Color(DEFAULT_SHAPE_COLOR);
const sRGB = new Color();
const sRgb = sRGB.copyLinearToSRGB(thisColor);
const contrastColor = `#${new Color(getContrastColor(thisColor)).getHexString()}`;
const DEFAULT_FONT_SIZE = 12; // pixels
const DEFAULT_FONT_WEIGHT = 'bold';
const tmpIntersectList: Intersection[] = [];

/**
 * Pick result on {@link VectorLabelsEntity}
 */
export type LabelPickResult = PickResult & {
    isLabelPickResult: true;
    // eslint-disable-next-line no-use-before-define
    entity: VectorLabelsEntity;
};

export interface VectorLabelOptions {
    /**
     * Callback for generating the text of labels
     * @param feature - Feature corresponding to the label
     * @param at - 3D position
     * @returns Content of the label to create
     */
    text?: (feature: SimpleFeature, at: Vector3) => string;
    /**
     * Callback for styling the label
     * @param span - Label
     * @param feature - Feature corresponding to the label
     * @returns Nothing
     */
    style?: (span: HTMLSpanElement, feature: SimpleFeature) => void;
}

/**
 * Entity for displaying vector data as labels
 */
export default class VectorLabelsEntity extends Entity3D {
    readonly sources: VectorMeshSource[];
    private _labels: CSS2DObject[];
    private _textCallback: (feature: SimpleFeature, at: Vector3) => string;
    private _styleCallback?: (span: HTMLSpanElement, feature: SimpleFeature) => void;

    constructor(sources: VectorMeshSource | VectorMeshSource[], options?: VectorLabelOptions) {
        super(new Group());
        this.sources = Array.isArray(sources) ? sources : [sources];
        this._labels = [];
        this._textCallback = options?.text || (() => 'P');
        this._styleCallback = options?.style;
    }

    updateVisibility(): void {
        // Setting the root object's visibility is not enough
        // to set the visibility of CSS2DObjects (labels).
        this.object3d.traverse(o => {
            o.visible = this.visible;
        });
    }

    updateOpacity(): void {
        // Opacity is driven by CSS, not by Threejs rendering
        const cssOpacity = `${this.opacity * 100}%`;
        this._labels.forEach(label => (label.element.style.opacity = cssOpacity));
    }

    private updateStyle(span: HTMLSpanElement, feature: SimpleFeature) {
        // Taken from Giro3D's Shape entity
        span.style.backgroundColor = `rgb(${sRgb.r * 255} ${sRgb.g * 255} ${sRgb.b * 255})`;
        span.style.borderWidth = '1px';
        span.style.borderStyle = 'solid';
        span.style.borderColor = contrastColor;
        span.style.borderRadius = `${MathUtils.clamp(DEFAULT_FONT_SIZE - 4, 5, 10)}px`;
        span.style.color = contrastColor;
        const padding = MathUtils.clamp(Math.round(DEFAULT_FONT_SIZE / 4), 2, 10);
        span.style.padding = `${padding}px ${padding}px ${padding}px ${padding}px`;
        span.style.fontSize = `${DEFAULT_FONT_SIZE}px`;
        span.style.fontWeight = DEFAULT_FONT_WEIGHT;
        span.style.pointerEvents = 'auto';

        if (this._styleCallback) {
            this._styleCallback(span, feature);
        }
    }

    private createLabel(at: Vector3, feature: SimpleFeature): CSS2DObject {
        // Taken from Giro3D's Shape entity
        const container = document.createElement('div');
        const span = document.createElement('span');

        this.updateStyle(span, feature);

        span.innerText = this._textCallback(feature, at);

        const innerContainer = document.createElement('div');

        container.appendChild(innerContainer);
        innerContainer.appendChild(span);

        const object = new CSS2DObject(container);
        object.position.copy(at);
        object.updateMatrix();
        object.updateMatrixWorld(true);

        container.addEventListener('mouseover', () => (object.userData.hover = true));
        container.addEventListener('mouseleave', () => (object.userData.hover = false));

        return object;
    }

    protected async preprocess(): Promise<void> {
        for (const source of this.sources) {
            // TODO: avoid await in the loop
            const olFeatures = await source.load(this.instance);
            const root = new Group();

            const defaultElevation = source.elevation ?? 0;
            const getPoint = (c: Coordinate): Vector3 => {
                return new Vector3(c[0], c[1], c[2] ?? defaultElevation);
            };

            for (const olFeature of olFeatures) {
                const geometry = olFeature.getGeometry();

                if (geometry != null) {
                    const type = geometry.getType() as SimpleGeometryType;
                    const coordinates: Coordinate[] = [];

                    switch (type) {
                        case 'Point':
                            coordinates.push(geometry.getCoordinates() as Coordinate);
                            break;
                        case 'MultiPoint':
                        case 'LineString':
                            coordinates.push(...(geometry.getCoordinates() as Coordinate[]));
                            break;
                        case 'MultiLineString':
                        case 'Polygon':
                            coordinates.push(...(geometry.getCoordinates() as Coordinate[][])[0]);
                            break;
                        case 'MultiPolygon':
                            coordinates.push(
                                ...(geometry.getCoordinates() as Coordinate[][][])[0][0],
                            );
                            break;
                        default:
                        // do nothing
                    }

                    if (coordinates.length > 0) {
                        const labels = coordinates.map(c =>
                            this.createLabel(getPoint(c), olFeature),
                        );
                        const group = new Group();
                        labels.forEach(l => {
                            group.add(l);
                            this._labels.push(l);
                        });

                        for (const [name, value] of Object.entries(olFeature.getProperties())) {
                            if (name !== 'geometry') {
                                group.userData[name] = value;
                            }
                        }
                        root.add(group);
                    }
                }
            }

            this.object3d.add(root);
            this.onObjectCreated(root);

            const context = source.context();
            fillObject3DUserData(root, { filename: context.filename });
        }
        this.notifyChange(this.object3d);
    }

    private pickLabels(raycaster: Raycaster): CSS2DObject | null {
        let pickedLabel: CSS2DObject | null = null;

        this._labels.forEach(label => {
            if (pickedLabel == null) {
                tmpIntersectList.length = 0;
                this.raycastLabel(label, raycaster, tmpIntersectList);
                if (tmpIntersectList.length > 0) {
                    pickedLabel = label;
                }
            }
        });

        return pickedLabel;
    }

    private raycastLabel(label: CSS2DObject, raycaster: Raycaster, intersects: Intersection[]) {
        if (label.userData.hover === true) {
            intersects.push({
                object: label,
                point: label.position,
                distance: label.position.distanceTo(raycaster.ray.origin),
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pick(coordinates: Vector2, _options?: PickOptions): LabelPickResult[] {
        const normalized = this.instance.canvasToNormalizedCoords(coordinates, tmpNDC);
        const raycaster = new Raycaster();
        raycaster.setFromCamera(normalized, this.instance.view.camera);

        // TODO: pickLabels should honor _options.filter
        const pickedLabel = this.pickLabels(raycaster);
        if (pickedLabel) {
            const pickResult: LabelPickResult = {
                isLabelPickResult: true,
                entity: this,
                point: pickedLabel.position,
                object: pickedLabel,
                distance: pickedLabel.position.distanceTo(raycaster.ray.origin),
            };

            return [pickResult];
        }

        return [];
    }

    getBoundingBox(): Box3 | null {
        // For some reason (because of nested groups?), Three.js does not
        // compute correctly the bounding box of this.object3d
        const pts = this._labels.map(l => l.position);
        const box = new Box3().setFromPoints(pts);
        return box;
    }
}
