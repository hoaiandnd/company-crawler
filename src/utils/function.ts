export const waitRandom = () => {
  const min = 500
  const max = 1500
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  console.log(`Waiting for ${delay}ms`)
  return new Promise(resolve => setTimeout(resolve, delay))
}
