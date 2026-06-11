import { Defaults } from '@/constants/default.js'
import { ErrorMessage } from '@/constants/error.js'
import { SearchParams } from '@/constants/search-params.js'
import {
  DriverContext,
  IDriverPaginator,
  PaginationInfo,
  PaginationResult
} from '@/types/driver.js'

export class DriverPaginator implements IDriverPaginator {
  protected _provinceSlugs: string[] = []
  validateUrl(url: string): boolean | Promise<boolean> {
    if (!url) {
      throw new Error(ErrorMessage.ERR_NO_URL)
    }
    const urlObj = new URL(url)
    if (urlObj.origin !== 'https://hoptackinhdoanh.com') return false

    const pathMatch = urlObj.pathname.match(
      /^\/danh-ba-doanh-nghiep\/([a-z0-9-]+)$/
    )
    if (!pathMatch) return false
    return true
  }
  getStartPage(crawlRequest: DriverContext['crawlRequest']): number {
    let startPage = crawlRequest.filters?.page?.from
    if (!startPage || startPage < 1) {
      // trường hợp không có thông tin về trang bắt đầu, kiểm tra trên url có thông tin trang hay không, nếu không thì bắt đầu bằng 1
      const params = new URLSearchParams(crawlRequest.url)
      const pageParam = params.get(SearchParams.PAGE)
      startPage = parseInt(pageParam ?? '', 10) || Defaults.START_PAGE
    }
    return startPage
  }

  paginate(
    context: DriverContext
  ): PaginationResult | Promise<PaginationResult> {
    const { crawlRequest } = context
    const url = crawlRequest.url
    if (!url) {
      throw new Error(ErrorMessage.ERR_NO_URL)
    }
    const urlValidationResult = this.validateUrl(url)
    if (!urlValidationResult) throw new Error(ErrorMessage.ERR_INVALID_REQUEST)
    const startPage = this.getStartPage(crawlRequest)
    function createPaginationInfo(url: string, page: number): PaginationInfo {
      const urlObj = new URL(url)
      urlObj.searchParams.set(SearchParams.PAGE, page.toString())
      return {
        url: urlObj.toString(),
        page
      }
    }
    let current = createPaginationInfo(url, startPage)
    let next = createPaginationInfo(url, startPage + 1)
    return {
      current,
      next,
      goNext() {
        ;((current = { ...next }),
          (next = createPaginationInfo(url, current.page + 1)))
      }
    }
  }
}
