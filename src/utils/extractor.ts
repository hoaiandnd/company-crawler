import { ErrorMessage } from '@/constants/error.js'
import { CheerioAPI } from 'cheerio'

export const getDomainFromUrl = (url: string) => {
  const urlObj = new URL(url)
  return urlObj.hostname
}
export const toTextMap = <TObject extends object, TKey extends keyof TObject>(
  $: CheerioAPI,
  obj: TObject
) => {
  return {
    get: (key: TKey) => {
      if (!obj[key] && obj[key] !== '')
        throw new Error(ErrorMessage.ERR_KEY_NOT_EXIST_IN_OBJECT)
      if (typeof obj[key] !== 'string')
        throw new Error(ErrorMessage.ERR_INVALID_SELECTOR)
      return $(obj[key]).text().trim()
    }
  }
}
export const toObjectMap = <TObject extends object, TKey extends keyof TObject>(
  $: CheerioAPI,
  obj: TObject,
  ...keys: TKey[]
) => {
  const textMap = toTextMap($, obj)
  return keys.reduce(
    (acc, key) => {
      acc[key] = textMap.get(key)
      return acc
    },
    {} as Record<TKey, string>
  )
}
