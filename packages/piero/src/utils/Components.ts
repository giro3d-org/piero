import type { Ref } from 'vue';
import { ref, watch } from 'vue';

/**
 * Stores reference and watches for changes on a property of an object
 * @param object - Object
 * @param propName - Property name
 * @returns Watched reference to the property
 */
export function refAndWatch<T, K extends keyof T>(object: T, propName: K): Ref<T[K]> {
    const p = ref(object[propName]) as Ref<T[K]>;
    watch(
        () => object[propName],
        newValue => {
            p.value = newValue;
        },
    );
    return p;
}
