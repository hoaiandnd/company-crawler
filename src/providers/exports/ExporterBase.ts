import { ErrorMessage } from '@/constants/error.js'
import path from 'path'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export abstract class ExporterBase {
  protected _getFileName(fileName: string | undefined | null) {
    if (!fileName) throw new Error(ErrorMessage.ERR_NO_FILE_NAME)
    const fullPath = path.join(__dirname, '..', '..', 'exporters', `${fileName}`)
    return fullPath
  }
}
