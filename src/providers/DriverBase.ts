import pLimit from 'p-limit'

import { CrawlResult, DriverComponent, ExportOptions } from '@/types/driver.js'
import { getDomainFromUrl } from '@/utils/extractor.js'
import { waitRandom } from '@/utils/function.js'
import { DriverContext } from '@/providers/DriverContext.js'
import { ErrorMessage } from '@/constants/error.js'

export class DriverBase<
  TCrawlData extends { phone: string },
  TFetchOptions = RequestInit
> {
  protected readonly _components: DriverComponent<TCrawlData, TFetchOptions>
  // chứa các thông tin sẽ được truyền cho các thành phần của driver
  protected readonly _context: DriverContext

  constructor(
    components: DriverComponent<TCrawlData, TFetchOptions>,
    context: DriverContext
  ) {
    this._components = components
    this._context = context
  }
  protected _setFetchQueue(companyLinks: string[]) {
    const DEFAULT_CRAWL_LIMIT = 5
    const limiter = pLimit(
      this._context?.driverConfig?.crawlLimit ?? DEFAULT_CRAWL_LIMIT
    )
    const fetchAndCrawl = async (url: string) => {
      try {
        const html = await this._components.fetcher.fetch(url)
        const companyDetail = await this._components.crawler.crawl(
          html,
          this._context?.driverConfig
        )
        const isValid = await this._components.validator?.validate(
          this._context,
          companyDetail
        )
        return isValid ? companyDetail : null
      } catch {
        console.log(`CANNOT FETCH '${url}'`)
        return null
      }
    }
    const fetchQueue = companyLinks.map(url =>
      limiter(() => fetchAndCrawl(url))
    )
    return Promise.all(fetchQueue)
  }
  async _run(exportOptions?: ExportOptions<TCrawlData>): Promise<CrawlResult> {
    // sử dụng các thành phần đề tạo thành một chức năng hoàn chỉnh
    const { paginator, fetcher, crawler, exporters } = this._components
    const { url, filters, exportFormat } = this._context.crawlRequest
    const { selectors, crawlLimit } = this._context.driverConfig
    const crawlDomain = getDomainFromUrl(url)
    if (!crawlDomain) {
      throw new Error(ErrorMessage.ERR_INVALID_REQUEST)
    }
    // load and save driver configurations
    let limit = filters?.limit && filters.limit > 0 ? filters.limit : crawlLimit
    const page = await paginator.paginate(this._context)
    const format = exportFormat ?? 'csv'
    const exportedFileName =
      exportOptions?.fileName ??
      `${crawlDomain}_${Date.now()}.${format.replace(/^\./, '')}`
    while (limit >= 0) {
      await waitRandom()

      const html = await fetcher.fetch(page.current.url)
      const companyLinks = await crawler.crawlLinks(
        html,
        selectors?.companyLinks ?? ''
      )

      const companies = await this._setFetchQueue(companyLinks)

      const exporter = exporters?.find(e => e.canHandle(format))
      if (exporter) {
        const transformFn = exportOptions?.transformFn ?? (data => data) // nếu không có transformFn, sử dụng hàm mặc định trả về dữ liệu gốc
        const transformedCompnanies = []
        for (const company of companies) {
          if (company) {
            transformedCompnanies.push(transformFn(company))
          }
        }
        await exporter.export(transformedCompnanies, {
          ...exportOptions,
          fileName: exportedFileName
        })
        transformedCompnanies.length = 0 // giải phóng bộ nhớ
      } else {
        companies.forEach(company => console.log(company?.phone ?? 'NO PHONE'))
      }
      companies.length = 0 // giải phóng bộ nhớ cho mảng sau khi xuất dữ liệu
      await page.goNext()
      limit--
    }
    if (limit < 0) {
      return {
        isFinish: true,
        lastPage: page.current.page,
        exportedFileName
      }
    } else {
      return {
        isFinish: false,
        lastPage: page.current.page
      }
    }
  }
}
