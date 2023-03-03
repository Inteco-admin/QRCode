export const dateFormat = (date: string) => {
  let formatedDate: string
  try {
    formatedDate = new Date(date).toLocaleDateString()
  } catch (error) {
    throw new Error('Cannot change date format')
  }
  return formatedDate
}
