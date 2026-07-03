import { DriverExporterOptions, IDriverExporter } from '@/types/driver.js'
import { writeFile } from 'node:fs/promises'
import path from 'path'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class TextExporter implements IDriverExporter {
  canHandle(format: string): boolean {
    return format === 'txt'
  }
  async export<T = any>(data: T[], options?: DriverExporterOptions<T>): Promise<void> {
    console.log('TEXT EXPORTER RUNNING ...')
    const fileName = options?.fileName || Date.now()
    const text = data.map(item => {
      if (typeof item === 'object' && item !== null) {
        const objectKeys = Object.keys(item) as (keyof T)[]
        const values = objectKeys.map(key => item[key])
        const line = values.join('\n')
        return line + '\n'
      }
      return ''
    })
    const fullPath = path.join(__dirname, '..', '..', 'exporters', `${fileName}`)
    console.log('TEXT EXPORTER LOG BUFFER', Buffer.isBuffer(text))
    writeFile(fullPath, text.join('\n'), {
      encoding: 'utf8',
      // mode: 0o777,
      flag: 'a'
    })
  }
  close() {}
}
