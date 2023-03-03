export const encode = (string: string) => {
  const stringIsInvalid = string === undefined || typeof string !== 'string' || string.length < 1
  if (stringIsInvalid) throw new Error('Cannot encodeURIComponent(string),' + ' string is invalid')
  return encodeURIComponent(string)
}
