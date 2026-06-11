// import { CrawlRequest } from '@/types/common.js'
// import { DriverComponent, DriverContext } from '@/types/driver.js'
// import { getDomainFromUrl } from '@/utils/extractor.js'

// export class DriverBuilder<TData, TFetchOptions = RequestInit> {
//   private _context!: DriverContext
//   private _components: DriverComponent<TData, TFetchOptions>
//   constructor(components: DriverComponent<TData, TFetchOptions>) {
//     this._components = components
//   }
//   public async init(crawlRequest: CrawlRequest) {
//     if (!crawlRequest) {
//       throw new Error('ERR_NO_REQUEST_DATA')
//     }
//     const driverConfig = await this._components.configLoader.load(getDomainFromUrl(crawlRequest.url))
//     this._context = { crawlRequest, driverConfig }
//   }
// }
