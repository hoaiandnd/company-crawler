import { ErrorMessage } from '@/constants/error.js'
import { Driver } from '@/providers/Driver.js'
import { CrawlResult, ExportOptions, IDriverConfigurationLoader } from '@/types/driver.js'
import { getDomainFromUrl } from '@/utils/extractor.js'
import { waitRandom } from '@/utils/function.js'
import { url } from 'inspector/promises'
import pLimit from 'p-limit'

export type DriverComponent<TCrawlData, TFetchOptions> = {
  configLoader: IDriverConfigurationLoader
  paginator: IDriverPaginator
  fetcher: IDriverFetcher<TFetchOptions>
  crawler: IDriverCrawler<TCrawlData>
  exporters?: IDriverExporter[]
  validator?: IDriverValidator<TCrawlData>
}

export class DriverBase<TCrawlData extends { phone: string }, TFetchOptions = RequestInit> extends Driver<TCrawlData> {
  protected readonly _components: DriverComponent<TCrawlData, TFetchOptions>
  constructor(components: DriverComponent<TCrawlData, TFetchOptions>) {
    super()
    this._components = components
  }
  protected _setFetchQueue(companyLinks: string[]) {
    const DEFAULT_CRAWL_LIMIT = 5
    const limiter = pLimit(this._context?.driverConfig?.crawlLimit ?? DEFAULT_CRAWL_LIMIT)
    const fetchAndCrawl = async (url: string) => {
      const html = await this._components.fetcher.fetch(url)
      const companyDetail = await this._components.crawler.crawl(html, this._context?.driverConfig)
      const isValid = await this._components.validator?.validate(companyDetail)
      return isValid ? companyDetail : null
    }
    const fetchQueue = companyLinks.map(url => limiter(() => fetchAndCrawl(url)))
    return Promise.all(fetchQueue)
  }
  protected async _run(exportOptions?: ExportOptions<TCrawlData>): Promise<CrawlResult> {
    if (!this._context) {
      throw new Error(ErrorMessage.ERR_DRIVER_HAS_NO_CONTEXT)
    }
    if (!this._context.crawlRequest) {
      throw new Error(ErrorMessage.ERR_NO_REQUEST_DATA)
    }
    // sử dụng các thành phần đề tạo thành một chức năng hoàn chỉnh
    const { configLoader, paginator, fetcher, crawler, exporters } = this._components
    const { url, filters } = this._context?.crawlRequest
    const crawlDomain = getDomainFromUrl(url)
    // load and save driver configurations
    this._context.driverConfig = await configLoader.load(crawlDomain)
    let crawlLimit = filters?.limit && filters.limit > 0 ? filters.limit : this._context.driverConfig.crawlLimit
    const page = paginator.paginate(this._context.crawlRequest)

    while (crawlLimit >= 0) {
      await waitRandom()

      const html = await fetcher.fetch(page.current.url)
      const companyLinks = await crawler.crawlLinks(html, this._context.driverConfig?.selectors?.companyLinks ?? '')

      const companies = await this._setFetchQueue(companyLinks)

      //  transform `companies` before exporting ...

      paginator.goNext()
      crawlLimit--
    }
  }
}
