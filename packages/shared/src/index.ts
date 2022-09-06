export const isObject = (val: any) => {
  return typeof val === 'object' && val !== null
}

export const isFunction = (val: any) => {
  return typeof val === 'function'
}