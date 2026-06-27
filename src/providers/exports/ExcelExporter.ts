import { DriverExporterOptions, IDriverExporter } from '@/types/driver.js'
import ExcelJS from 'exceljs'

// const workbook = new ExcelJS.Workbook()
// const worksheet = workbook.addWorksheet('Danh sách')
import path from 'path'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class ExcelExporter implements IDriverExporter {
  private _workbook?: ExcelJS.stream.xlsx.WorkbookWriter
  private _worksheet?: ExcelJS.Worksheet
  canHandle(format: string): boolean {
    return ['csv', 'xlsx'].includes(format)
  }
  protected ensureInitWorkbook<T>(filename: string, firstObject: T) {
    if (!this._workbook) {
      this._workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ filename })
      this._worksheet = this._workbook.addWorksheet('Data')
      if (typeof firstObject === 'object' && firstObject !== null) {
        const keys = Object.keys(firstObject)
        this._worksheet.columns = keys.map(key => ({
          header: key,
          key
        }))
      }
    }
    return this._workbook
  }
  async export<T = any>(
    data: T[],
    options?: DriverExporterOptions<T>
  ): Promise<void> {
    const fileName = options?.fileName || Date.now()
    const fullPath = path.join(
      __dirname,
      '..',
      '..',
      'exporters',
      `${fileName}`
    )
    this.ensureInitWorkbook(fullPath, data[0])
    console.log('ExcelExporter log data >>> ', JSON.stringify(data))
    // this._worksheet!.addRow(Object.values(data)).commit()
    for (const row of data) {
      this._worksheet!.addRow(row).commit()
    }
  }
  async close(): Promise<void> {
    if (!this._workbook) return
    this._worksheet!.commit()
    await this._workbook!.commit()
  }
}
