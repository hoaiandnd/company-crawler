import { ExporterBase } from '@/providers/exports/ExporterBase.js'
import { DriverConfig, DriverExporterOptions, IDriverExporter } from '@/types/driver.js'
import { writeFile } from 'node:fs/promises'

export class TextExporter extends ExporterBase implements IDriverExporter {
  // constructor(driverConfig: DriverConfig) {
  //   super(driverConfig)
  // }
  canHandle(format: string): boolean {
    return format === 'txt'
  }
  async export<T = any>(data: T[], options?: DriverExporterOptions<T>, configs?: DriverConfig): Promise<void> {
    console.log('TEXT EXPORTER RUNNING ...')
    const fileName = options?.fileName
    const text = data.map(item => {
      if (typeof item === 'object' && item !== null) {
        const objectKeys = Object.keys(item) as (keyof T)[]
        const values = objectKeys.map(key => item[key])
        const line = values.join('\n')
        return line + '\n'
      }
      return ''
    })
    const fullPath = this._getFileName(fileName)

    writeFile(fullPath, text.join('\n'), {
      encoding: 'utf8',
      // mode: 0o777,
      flag: 'a'
    })
  }
  close() {}
}
