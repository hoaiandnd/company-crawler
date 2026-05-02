import { ErrorMessage } from '@/constants/error.js'
import { CrawlRequest } from '@/types/common.js'
import { CrawlResult, ExportOptions } from '@/types/driver.js'

// export abstract class Driver<TData = any> {
//   protected abstract _run(exportOptions?: ExportOptions<TData>): CrawlResult | Promise<CrawlResult>
//   public crawl(crawlRequest: CrawlRequest) {
//     if (!crawlRequest) {
//       throw new Error(ErrorMessage.ERR_NO_REQUEST_DATA)
//     }
//     this._context = { crawlRequest }
//     return this
//   }
//   public export(exportOptions?: ExportOptions<TData>) {
//     return this._run(exportOptions)
//   }
// }