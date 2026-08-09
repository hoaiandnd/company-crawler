export const waitRandom = () => {
  const min = 500
  const max = 1500
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise(resolve => setTimeout(resolve, delay))
}
export const isNotNullable = <T>(value: T | undefined | null): value is NonNullable<T> => {
  return value !== undefined && value !== null
}
