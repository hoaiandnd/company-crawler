import { CrawlRequest } from '@/types/common.js'
import { DriverConfig, IDriverConfigurationLoader } from '@/types/driver.js'
import { getDomainFromUrl } from '@/utils/extractor.js'

export class DriverContext {
  private _crawlRequest?: CrawlRequest
  private _driverConfig?: DriverConfig
  constructor(crawlRequest: CrawlRequest, driverConfig: DriverConfig) {
    this._crawlRequest = crawlRequest
    this._driverConfig = driverConfig
  }
  static async create(crawlRequest: CrawlRequest, configLoader: IDriverConfigurationLoader): Promise<DriverContext> {
    const driverConfig = await configLoader.load(getDomainFromUrl(crawlRequest.url))
    return new DriverContext(crawlRequest, driverConfig)
  }
  get crawlRequest(): CrawlRequest {
    if (!this._crawlRequest) {
      throw new Error('Driver context has no crawl request')
    }
    return this._crawlRequest
  }
  get driverConfig(): DriverConfig {
    if (!this._driverConfig) {
      throw new Error('Driver context has no driver config')
    }
    return this._driverConfig
  }
}
