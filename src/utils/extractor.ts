export const getDomainFromUrl = (url: string) => {
  const urlObj = new URL(url)
  return urlObj.hostname
}