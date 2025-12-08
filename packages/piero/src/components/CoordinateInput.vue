<script setup lang="ts">
    import type Instance from '@giro3d/giro3d/core/Instance';
    import type { Vector3 } from 'three';

    import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
    import { ref } from 'vue';

    import type SceneCursorManager from '@/services/SceneCursorManager';

    import ButtonWithIcon from '@/components/atoms/ButtonWithIcon.vue';
    import Picker from '@/services/Picker';
    import { nonNull } from '@/utils/Types';

    const props = defineProps<{
        cursorManager?: SceneCursorManager;
        /**
         * The initial value of the coordinates.
         * @defaultValue `(0, 0, 0)`
         */
        initialValue?: Vector3;
        /**
         * The Giro3D instance to perform picking. If undefined, the picking button is hidden.
         */
        instance?: Instance;
        /**
         * The label to display.
         */
        label: string;
        /**
         * Display the Z component ?
         * @defaultValue false
         */
        showZ?: boolean;
    }>();

    const x = ref(props.initialValue?.x ?? 0);
    const y = ref(props.initialValue?.y ?? 0);
    const z = ref(props.initialValue?.z ?? 0);

    const emits = defineEmits<{
        'update:coordinates': [value: Coordinates];
    }>();

    const picker = new Picker();
    const isPicking = ref(false);

    const emitCoordinates = (): void => {
        emits(
            'update:coordinates',
            new Coordinates(nonNull(props.instance).referenceCrs, x.value, y.value, z.value),
        );
    };

    const pickCoordinate = (): void => {
        const instance = nonNull(props.instance);

        isPicking.value = true;

        const onMouseMove = (e: MouseEvent): void => {
            const p = picker.getFirstFeatureAt(instance, e)?.at(0)?.point;

            if (p) {
                x.value = p.x;
                y.value = p.y;
                z.value = p.z;

                props.cursorManager?.setCursor('location');
                props.cursorManager?.setCursorLocation(p);
            }
        };

        const onClick = (e: MouseEvent): void => {
            props.cursorManager?.setCursor(null);
            instance.domElement.removeEventListener('click', onClick);
            instance.domElement.removeEventListener('mousemove', onMouseMove);
            isPicking.value = false;

            const p = picker.getFirstFeatureAt(instance, e)?.at(0)?.point;

            if (p) {
                x.value = p.x;
                y.value = p.y;
                z.value = p.z;

                emitCoordinates();
            }
        };

        instance.domElement.addEventListener('mousemove', onMouseMove);
        instance.domElement.addEventListener('click', onClick);
    };

    function setX(v: number): void {
        x.value = v;
        emitCoordinates();
    }

    function setY(v: number): void {
        y.value = v;
        emitCoordinates();
    }

    function setZ(v: number): void {
        z.value = v;
        emitCoordinates();
    }
</script>

<template>
    <div class="input-group">
        <label class="form-label">{{ props.label }}</label>
        <div class="input-group">
            <input
                type="number"
                class="form-control"
                id="plane-center-x"
                :value="x.toFixed(2)"
                @input="event => setX(Number.parseFloat((event.target as HTMLInputElement).value))"
            />
            <input
                type="number"
                class="form-control"
                id="plane-center-y"
                :value="y.toFixed(2)"
                @input="event => setY(Number.parseFloat((event.target as HTMLInputElement).value))"
            />
            <input
                type="number"
                v-if="props.showZ === true"
                class="form-control"
                id="plane-center-z"
                :value="z.toFixed(2)"
                @input="event => setZ(Number.parseFloat((event.target as HTMLInputElement).value))"
            />
            <ButtonWithIcon
                v-if="props.instance != null"
                title="Pick point in scene"
                icon="fg-location"
                :disabled="isPicking"
                @click="pickCoordinate"
                class="btn-primary"
            />
        </div>
    </div>
</template>
