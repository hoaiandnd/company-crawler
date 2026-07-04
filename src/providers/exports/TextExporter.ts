import { ExporterBase } from '@/providers/exports/ExporterBase.js'
import { DriverConfig, ExporterOptions, IDriverExporter } from '@/types/driver.js'
import { writeFile } from 'node:fs/promises'

export class TextExporter extends ExporterBase<'txt'> implements IDriverExporter {
  constructor() {
    super('txt')
  }
  canHandle(format: string): boolean {
    return format === 'txt'
  }
  async export<T = any>(data: T[], options?: ExporterOptions<T>, configs?: DriverConfig): Promise<void> {
    console.log('TEXT EXPORTER RUNNING ...')
    const fileName = options?.fileName
    const txtExportOptions = configs?.exporterOptions?.['txt']
    const text = data.map(item => {
      if (typeof item === 'object' && item !== null) {
        const objectKeys = Object.keys(item) as (keyof T)[]
        const values = objectKeys.map(key => item[key])
        const line = values.join(txtExportOptions?.propertyDelimiter ?? ',')
        return line + (txtExportOptions?.itemDelimiter ?? '')
      }
      return ''
    })
    const fullPath = this._getFileName(fileName)

    writeFile(fullPath, text.join(txtExportOptions?.itemDelimiter ?? ''), {
      encoding: 'utf8',
      // mode: 0o777,
      flag: 'a'
    })
  }
  close() {}
}
