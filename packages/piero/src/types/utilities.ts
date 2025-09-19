/* Only optional properties of T */
export type ExtractOptional<T extends object> = Pick<T, OptionalPropertyOf<T>>;

/** Keys of optional properties of T */
export type OptionalPropertyOf<T extends object> = Exclude<
    {
        [K in keyof T]: T extends Record<K, T[K]> ? never : K;
    }[keyof T],
    undefined
>;
