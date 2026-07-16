import type { PieroContext } from '@giro3d/piero';

import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import { fillObject3DUserData } from '@giro3d/piero';
import { Box3, Group, Vector3 } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const isObject = (obj: unknown): obj is object => obj != null && typeof obj === 'object';

export interface OBJSource {
    name?: string;
    url: Blob | string;
}

export default class OBJEntity extends Entity3D {
    public readonly isOBJEntity = true as const;
    public readonly source: OBJSource;
    public override readonly type = 'OBJEntity' as const;

    private readonly _context: PieroContext;

    public constructor(source: OBJSource, context: PieroContext) {
        super(new Group());
        this.source = source;
        this._context = context;
    }

    public static isOBJEntity = (obj: unknown): obj is OBJEntity =>
        isObject(obj) && (obj as OBJEntity).isOBJEntity;

    public override async preprocess(): Promise<void> {
        const content = await this._context.http.getText(this.source.url);

        // Translate vertices so they're close to 0 to avoid flickering
        const lines: string[] = content.split('\n');
        const volume = new Box3().makeEmpty();
        const vec3 = new Vector3();
        lines
            .filter(line => line.startsWith('v '))
            .forEach(line => {
                const [_, x, y, z] = line.split(' ');
                vec3.set(parseFloat(x), parseFloat(y), parseFloat(z));
                volume.expandByPoint(vec3);
            });
        volume.getCenter(vec3);

        const newLines = lines.map(line => {
            if (line.startsWith('v ')) {
                const it = line.split(' ');
                it[1] = (parseFloat(it[1]) - vec3.x).toString();
                it[2] = (parseFloat(it[2]) - vec3.y).toString();
                it[3] = (parseFloat(it[3]) - vec3.z).toString();
                return it.join(' ');
            } else {
                return line;
            }
        });

        const loader = new OBJLoader();
        const object = loader.parse(newLines.join('\n'));

        if (this.source.name != null) {
            object.name = this.source.name;
        }

        object.position.set(vec3.x, vec3.y, vec3.z);
        object.updateWorldMatrix(true, true);
        object.updateMatrix();
        object.updateMatrixWorld(true);

        this.onObjectCreated(object);
        this.object3d.add(object);

        fillObject3DUserData(this, {
            filename: this.source.name ?? this._context.http.getContext(this.source.url).filename,
        });

        this.notifyChange(this.object3d);
    }
}
