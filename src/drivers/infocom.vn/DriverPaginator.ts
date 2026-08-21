import { Defaults } from '@/constants/default.js'
import { ErrorMessage } from '@/constants/error.js'
import { SearchParams } from '@/constants/search-params.js'
import { DriverContext, IDriverPaginator, PaginationInfo, PaginationResult } from '@/types/driver.js'

export class DriverPaginator implements IDriverPaginator {
  protected _provinceSlugs: string[] = [
    'tuyen-quang',
    'lao-cai',
    'thai-nguyen',
    'phu-tho',
    'bac-ninh',
    'hung-yen',
    'hai-phong',
    'ninh-binh',
    'quang-tri',
    'da-nang',
    'quang-ngai',
    'gia-lai',
    'khanh-hoa',
    'lam-dong',
    'dak-lak',
    'tp-ho-chi-minh',
    'dong-nai',
    'tay-ninh',
    'can-tho',
    'vinh-long',
    'dong-thap',
    'ca-mau',
    'an-giang',
    'ha-noi',
    'hue',
    'lai-chau',
    'dien-bien',
    'son-la',
    'lang-son',
    'quang-ninh',
    'thanh-hoa',
    'nghe-an',
    'ha-tinh',
    'cao-bang'
  ]
  validateUrl(url: string): boolean | Promise<boolean> {
    if (!url) {
      throw new Error(ErrorMessage.ERR_NO_URL)
    }
    const urlObj = new URL(url)
    if (urlObj.origin !== 'https://infocom.vn/') return false // không phải là trang đang hỗ trợ
    // const pathMatch = urlObj.pathname.match(
    //   /^\/danh-ba-doanh-nghiep\/([a-z0-9-]+)$/
    // )
    // if (!pathMatch) return false
    return true
  }
  getStartPage(crawlRequest: DriverContext['crawlRequest']): number {
    let startPage = crawlRequest.filters?.page?.from
    if (!startPage || startPage < 1) {
      // trường hợp không có thông tin về trang bắt đầu, kiểm tra trên url có thông tin trang hay không, nếu không thì bắt đầu bằng 1
      startPage = Number(crawlRequest.url.match(/\/trang-(\d+)/)?.[1] ?? Defaults.START_PAGE)
    }
    return startPage
  }
  createPaginationInfo = (url: string, page: number): PaginationInfo => {
    const urlObj = new URL(url)
    // Nếu URL đã có /trang-X thì thay thế
    if (/\/trang-\d+\/?$/.test(urlObj.pathname)) {
      urlObj.pathname = urlObj.pathname.replace(/\/trang-\d+\/?$/, `/trang-${page}`)
    } else {
      urlObj.pathname = `${urlObj.pathname.replace(/\/$/, '')}/trang-${page}`
    }
    return {
      url: urlObj,
      page
    }
  }
  paginate(context: DriverContext): PaginationResult | Promise<PaginationResult> {
    const { crawlRequest } = context
    const url = crawlRequest.url
    if (!url) {
      throw new Error(ErrorMessage.ERR_NO_URL)
    }
    // kiểm tra đường dẫn có phải hợp lệ với trang hoptackinhdoanh.com không
    const urlValidationResult = this.validateUrl(url)
    if (!urlValidationResult) throw new Error(ErrorMessage.ERR_INVALID_REQUEST)
    // lấy trang bắt đầu
    const startPage = this.getStartPage(crawlRequest)
    let current = this.createPaginationInfo(url, startPage)
    let next = this.createPaginationInfo(url, startPage + 1)
    return {
      current,
      next
    }
  }
  goNext(page: PaginationResult): PaginationResult {
    const current = this.createPaginationInfo(page.current.url.toString(), page.next.page)
    const next = this.createPaginationInfo(page.next.url.toString(), page.next.page + 1)
    return {
      ...page,
      current,
      next
    }
  }
}
