import { Defaults } from '@/constants/default.js'
import { ErrorMessage } from '@/constants/error.js'
import { DriverContext } from '@/providers/DriverContext.js'
import { CombinedSourceDriverComponent, CrawlResult, ExportOptions, FromPage, LimitPage, ToPage } from '@/types/driver.js'
import { getCrawlLimit, getDomainFromUrl } from '@/utils/extractor.js'
import { isNotNullable } from '@/utils/function.js'

export class CombinedSourceDriver<TCrawlData, TFetchOptions> {
  protected readonly _components: CombinedSourceDriverComponent<TCrawlData, TFetchOptions>
  protected readonly _context: DriverContext

  constructor(components: CombinedSourceDriverComponent<TCrawlData, TFetchOptions>, context: DriverContext) {
    this._components = components
    this._context = context
  }
  // return Promise<CrawlResult>
  async _run(exportOptions?: ExportOptions<TCrawlData>) {
    const { paginator, fetcher, sourceCrawler, targetCrawler, navigator, exporters } = this._components
    const { url: sourceUrl, filters, exportFormat } = this._context.crawlRequest
    const { selectors, crawlLimit } = this._context.driverConfig
    const crawlDomain = getDomainFromUrl(sourceUrl)
    if (!crawlDomain) {
      throw new Error(ErrorMessage.ERR_INVALID_REQUEST)
    }
    let page = await paginator.paginate(this._context)
    let [limit, from, to] = getCrawlLimit(crawlLimit, page, filters)
  }
}
