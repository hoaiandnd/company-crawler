import path from 'path'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export abstract class ExporterBase {
  protected _getFileName(fileName: string) {
    const fullPath = path.join(__dirname, '..', '..', 'exporters', `${fileName}`)
    return fullPath
  }
}
