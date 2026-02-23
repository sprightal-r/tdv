export interface Paged<T> {
    items: T[],
    length: number
}

export const EMPTY_PAGED = {
    items: [],
    length: 0
}