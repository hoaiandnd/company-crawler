import { ErrorMessage } from '@/constants/error.js'
import { CrawlRequest } from '@/types/common.js'
import { CrawlResult, DriverContext, ExportOptions } from '@/types/driver.js'

export abstract class Driver<TData = any> {
  protected _context?: DriverContext
  constructor() {
    this._context = undefined
  }
  protected abstract _run(exportOptions?: ExportOptions<TData>): CrawlResult | Promise<CrawlResult>
  public crawl(crawlRequest: CrawlRequest) {
    if (!crawlRequest) {
      throw new Error(ErrorMessage.ERR_NO_REQUEST_DATA)
    }
    this._context = { crawlRequest }
    return this
  }
  public export(exportOptions?: ExportOptions<TData>) {
    return this._run(exportOptions)
  }
}

export type PaginationInfo = {
  url: string // url đến trang được chỉ định - có thể sử dụng ngay
  page: number // chỉ số trang được xét - đồng bộ với `url`
}
export type PaginationResult = {
  current: PaginationInfo // trang hiện tại - dùng trực tiếp để fetch
  next: PaginationInfo // trang tiếp theo - dùng khi kết thúc fetch
  goNext: () => void | Promise<void> // thay đổi `current` và `next` của object hiện tại
}