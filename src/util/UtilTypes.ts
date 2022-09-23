export type KeysWith<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never
}[keyof T]