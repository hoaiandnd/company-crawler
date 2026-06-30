import { ErrorMessage } from '@/constants/error.js'
import { CheerioAPI } from 'cheerio'

export const getDomainFromUrl = (url: string) => {
  const urlObj = new URL(url)
  return urlObj.hostname
}
export const toTextMap = <TObject extends object, TKey extends keyof TObject>($: CheerioAPI, obj: TObject) => {
  return {
    get: (key: TKey) => {
      if (!obj[key] && obj[key] !== '') throw new Error(ErrorMessage.ERR_KEY_NOT_EXIST_IN_OBJECT)
      if (typeof obj[key] !== 'string') throw new Error(ErrorMessage.ERR_INVALID_SELECTOR)
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

export function getFileExtension(filename: string): string {
  if (!filename || typeof filename !== 'string') return ''

  // Loại bỏ query string và hash (nếu có)
  const cleanName = filename.split(/[?#]/)[0]

  // Lấy phần sau dấu "/" cuối (tránh trường hợp là path)
  const baseName = cleanName.split('/').pop() || ''

  // Nếu là file ẩn kiểu ".env" thì không coi là có extension
  if (baseName.startsWith('.') && baseName.indexOf('.', 1) === -1) {
    return ''
  }

  const lastDotIndex = baseName.lastIndexOf('.')

  // Không có dấu chấm hoặc dấu chấm ở đầu/cuối
  if (lastDotIndex <= 0 || lastDotIndex === baseName.length - 1) {
    return ''
  }

  return baseName.slice(lastDotIndex + 1).toLowerCase()
}
