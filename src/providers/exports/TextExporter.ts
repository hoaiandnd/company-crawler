import { DriverExporterOptions, IDriverExporter } from '@/types/driver.js'
import { writeFile } from 'node:fs/promises'
import path from 'path'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class TextExporter implements IDriverExporter {
  canHandle(format: string): boolean {
    return ['txt', '.txt'].includes(format)
  }
  async export<T = any>(
    data: T[],
    options?: DriverExporterOptions<T>
  ): Promise<void> {
    const fileName = options?.fileName || Date.now()
    const text = data.map(item => {
      if (typeof item === 'object' && item !== null) {
        const objectKeys = Object.keys(item) as (keyof T)[]
        let objectString = ''
        const values = objectKeys.map(key => item[key])
        const line = values.join(',')
        return line + '\n'
      }
    })
    const fullPath = path.join(
      __dirname,
      '..',
      '..',
      'exporters',
      `${fileName}.txt`
    )
    await writeFile(fullPath, text.toString(), {
      encoding: 'utf-8',
      mode: 0o777,
      flag: 'a'
    })
  }
}
