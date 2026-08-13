import pLimit from 'p-limit'

import { CrawlResult, DriverComponent, ExportOptions, FromPage, LimitPage, ToPage } from '@/types/driver.js'
import { getCrawlLimit, getDomainFromUrl, getFileExtension } from '@/utils/extractor.js'
import { isNotNullable, waitRandom } from '@/utils/function.js'
import { DriverContext } from '@/providers/DriverContext.js'
import { ErrorMessage } from '@/constants/error.js'
import { Defaults } from '@/constants/default.js'
import { slugifyUrl } from '@/utils/builder.js'

export class DriverBase<TCrawlData extends { phone: string }, TFetchOptions = RequestInit> {
  protected readonly _components: DriverComponent<TCrawlData, TFetchOptions>
  // chứa các thông tin sẽ được truyền cho các thành phần của driver
  protected readonly _context: DriverContext

  constructor(components: DriverComponent<TCrawlData, TFetchOptions>, context: DriverContext) {
    this._components = components
    this._context = context
  }
  protected _setFetchQueue(companyLinks: string[]) {
    const DEFAULT_CRAWL_LIMIT = 5
    const limiter = pLimit(this._context?.driverConfig?.crawlLimit ?? DEFAULT_CRAWL_LIMIT)
    const fetchAndCrawl = async (url: string) => {
      try {
        const html = await this._components.fetcher.fetch(url)
        const companyDetail = await this._components.crawler.crawl(html, this._context?.driverConfig)
        const isValid = await this._components.validator?.validate(this._context, companyDetail)
        return isValid ? companyDetail : null
      } catch (err) {
        console.log((err as Error)?.message)
        console.log(`CANNOT FETCH '${url}'`)
        return null
      }
    }
    const fetchQueue = companyLinks.map(url => limiter(() => fetchAndCrawl(url)))
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
    let page = await paginator.paginate(this._context)
    // const getCrawlLimit = (): readonly [LimitPage, FromPage, ToPage] => {
    //   // trường hợp không có filter trên request thì lấy thông tin từ file cấu hình
    //   if (!filters) return [crawlLimit, Defaults.START_PAGE, Defaults.START_PAGE + crawlLimit]
    //   const from = isNotNullable(filters.page?.from) && filters.page.from > 0 ? filters.page?.from : page.current.page
    //   if (isNotNullable(filters.page?.to) && filters.page?.to > from) {
    //     return [filters.page?.to - from, from, filters.page?.to]
    //   }
    //   const limit = filters?.limit && filters.limit > 0 ? filters.limit : crawlLimit
    //   return [limit, from, from + limit]
    // }
    let [limit, from, to] = getCrawlLimit(crawlLimit, page, filters)
    const format = exportFormat || getFileExtension(exportOptions?.fileName ?? '')
    // phải chỉ định format file (docx, txt, xlsx, ...), không thì dừng lại, không sử dụng giá trị mặc định
    if (!format) throw new Error(ErrorMessage.ERR_NO_EXPORT_FORMAT_PROVIDED)
    const extension = format.replace(/^\./, '')
    const exportedFileName = exportOptions?.fileName || `${slugifyUrl(url)}_f${from}-t${to}-${Date.now()}.${extension}`
    const exporter = exporters?.find(e => e.canHandle(format))
    // có format nhưng lại không có exporter tương ứng hỗ trợ
    if (format && !exporter) {
      console.log(`>>> FORMAT ${format.toUpperCase()} IS NOT SUPPORTED`)
    }
    while (limit >= 0) {
      await waitRandom()
      const html = await fetcher.fetch(page.current.url.toString())
      // console.log(JSON.parse(html))
      const companyLinks = await crawler.crawlLinks(html, selectors?.companyLinks ?? '')

      const companies = await this._setFetchQueue(companyLinks)

      if (exporter) {
        const transformFn = exportOptions?.transformFn ?? (data => data) // nếu không có transformFn, sử dụng hàm mặc định trả về dữ liệu gốc
        const transformedCompnanies = []
        for (const company of companies) {
          if (company) {
            transformedCompnanies.push(transformFn(company))
          }
        }
        await exporter.export(
          transformedCompnanies,
          {
            ...exportOptions,
            fileName: exportedFileName
          },
          this._context.driverConfig
        )
        transformedCompnanies.length = 0 // giải phóng bộ nhớ
      } else {
        console.log(`Exporter Not found`)
      }
      0
      companies.length = 0 // giải phóng bộ nhớ cho mảng sau khi xuất dữ liệu
      page = await paginator.goNext(page)
      limit--
    }
    await exporter?.close()
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
