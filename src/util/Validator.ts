export const isString = (a: any): a is string => typeof a === 'string'
export const isNumber = (a: any): a is number => typeof a === 'number'
export const isNumberButNotNaN = (a: any): a is number => isNumber(a) && !isNaN(a)
export const isArray = (a: any): a is any[] => Array.isArray(a)
export const isObject = (a: any): a is object => !isArray(a) && typeof a === 'object'
export const isInRange = (n: number, s: number, e: number) => n >= s && n <= e
export const isAssigableTo = (a: any, t: any[]) => t.some(b => a === b)
export const isLooselyAssignableTo = (a: any, t: any[]) => t.some(b => a == b)
export const isNotEmptyArray = (a: any): a is [any, ...any[]] => isArray(a) && a.length > 0
export const isEmptyString = (a: any): a is '' => isString(a) && a.length === 0
export const doesMatch = (a: any, r: RegExp) => r.test(a)