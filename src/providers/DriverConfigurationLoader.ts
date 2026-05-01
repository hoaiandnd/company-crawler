import { ErrorMessage } from '@/constants/error.js'
import { DriverConfig, IDriverConfigurationLoader } from '@/types/driver.js'
import { DriverConfigSchema } from '@/types/json-schema.js'
import { readFile } from 'fs/promises'

export class DriverConfigurationLoader implements IDriverConfigurationLoader {
  async load(domain: string): Promise<DriverConfig> {
    try {
      const text = await readFile(`./jsons/${domain}.json`, 'utf8')
      const json = JSON.parse(text)
      const result = DriverConfigSchema.parse(json)
      return result
    } catch {
      // json parsing error or schema validation error
      throw new Error(ErrorMessage.ERR_CANNOT_PARSE_DRIVER_CONFIG)
    }
  }
}
