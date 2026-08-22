import { Defaults } from '@/constants/default.js'
import { ErrorMessage } from '@/constants/error.js'
import { DriverContext } from '@/providers/DriverContext.js'
import { CombinedSourceDriverComponent, CrawlResult, ExportOptions, FromPage, LimitPage, ToPage } from '@/types/driver.js'
import { slugifyUrl } from '@/utils/builder.js'
import { getCrawlLimit, getDomainFromUrl, getFileExtension } from '@/utils/extractor.js'
import { isNotNullable, sleep } from '@/utils/function.js'

export class CombinedSourceDriver<TSourceCrawlData, TCrawlData, TFetchOptions = RequestInit> {
  protected readonly _components: CombinedSourceDriverComponent<TSourceCrawlData, TCrawlData, TFetchOptions>
  protected readonly _context: DriverContext

  constructor(components: CombinedSourceDriverComponent<TSourceCrawlData, TCrawlData, TFetchOptions>, context: DriverContext) {
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
    const format = exportFormat || getFileExtension(exportOptions?.fileName ?? '')
    // phải chỉ định format file (docx, txt, xlsx, ...), không thì dừng lại, không sử dụng giá trị mặc định
    if (!format) throw new Error(ErrorMessage.ERR_NO_EXPORT_FORMAT_PROVIDED)
    const extension = format.replace(/^\./, '')
    const exportedFileName = exportOptions?.fileName || `${slugifyUrl(sourceUrl)}_f${from}-t${to}-${Date.now()}.${extension}`
    const exporter = exporters?.find(e => e.canHandle(format))
    if (format && !exporter) {
      console.log(`>>> FORMAT ${format.toUpperCase()} IS NOT SUPPORTED`)
    }
    const traCuuMaSoThueWaitTime = 6
    while (limit >= 0) {
      // code
      await sleep(traCuuMaSoThueWaitTime * 1000)
      const html = await fetcher.fetch(page.current.url.toString())
      // lấy danh sách các dữ liệu nguồn từ trang hiện tại và gửi cho navigator
      const sourceDataList = await sourceCrawler.crawls(html, this._context.driverConfig)
      const companies: TCrawlData[] = []
      for (const sourceData of sourceDataList) {
        await sleep(traCuuMaSoThueWaitTime * 1000)
        const { url: targetUrl, options } = await navigator.getFetchOptions(sourceData, this._context.crawlRequest)
        const targetHtml = await fetcher.fetch(targetUrl, options)
        const targetData = await targetCrawler.crawl(targetHtml, this._context.driverConfig)
        companies.push(targetData)
      }
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
