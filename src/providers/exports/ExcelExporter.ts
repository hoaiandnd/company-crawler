import { ErrorMessage } from '@/constants/error.js'
import { ExporterBase } from '@/providers/exports/ExporterBase.js'
import { DriverExporterOptions, IDriverExporter } from '@/types/driver.js'
import ExcelJS from 'exceljs'

export class ExcelExporter extends ExporterBase implements IDriverExporter {
  private _workbook?: ExcelJS.stream.xlsx.WorkbookWriter
  private _worksheet?: ExcelJS.Worksheet
  canHandle(format: string): boolean {
    return ['xlsx'].includes(format)
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
  async export<T = any>(data: T[], options?: DriverExporterOptions<T>): Promise<void> {
    console.log('EXCEL EXPORTER RUNNING ...')
    const fileName = options?.fileName
    const fullPath = this._getFileName(fileName)
    this.ensureInitWorkbook(fullPath, data[0])
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
