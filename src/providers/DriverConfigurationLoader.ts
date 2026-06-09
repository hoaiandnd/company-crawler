import { ErrorMessage } from '@/constants/error.js'
import { DriverConfig, IDriverConfigurationLoader } from '@/types/driver.js'
import { DriverConfigSchema } from '@/types/json-schema.js'
import { readFile } from 'fs/promises'

export class DriverConfigurationLoader implements IDriverConfigurationLoader {
  async load(domain: string): Promise<DriverConfig> {
    try {
      console.log('...Loading driver configuration for domain:', domain)
      const filePath = `../jsons/${domain}.json`
      console.log(filePath)
      const text = await readFile(filePath, 'utf8')
      console.log('...Driver configuration loaded:', text)
      const json = JSON.parse(text)
      const result = DriverConfigSchema.parse(json)
      return result
    } catch {
      // json parsing error or schema validation error
      throw new Error(ErrorMessage.ERR_CANNOT_PARSE_DRIVER_CONFIG)
    }
  }
}
