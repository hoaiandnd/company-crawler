import { ErrorMessage } from '@/constants/error.js'
import { DriverConfig, IDriverConfigurationLoader } from '@/types/driver.js'
import { DriverConfigSchema } from '@/types/json-schema.js'
import { readFile } from 'fs/promises'
import path from 'path'

// import path from 'path';
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class DriverConfigurationLoader implements IDriverConfigurationLoader {
  async load(domain: string): Promise<DriverConfig> {
    try {
      const fullPath = path.join(__dirname, '..', 'jsons', `${domain}.json`)
      const text = await readFile(fullPath, 'utf8')
      const json = JSON.parse(text)
      const result = DriverConfigSchema.parse(json)
      return result
    } catch (err) {
      console.log((err as Error).message)
      // json parsing error or schema validation error
      throw new Error(ErrorMessage.ERR_CANNOT_PARSE_DRIVER_CONFIG)
    }
  }
}
