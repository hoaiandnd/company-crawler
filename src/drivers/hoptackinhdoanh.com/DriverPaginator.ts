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
    // kiểm tra đường dẫn có phải hợp lệ với trang hoptackinhdoanh.com không
    const urlValidationResult = this.validateUrl(url)
    if (!urlValidationResult) throw new Error(ErrorMessage.ERR_INVALID_REQUEST)
    // lấy trang bắt đầu
    const startPage = this.getStartPage(crawlRequest)
    const loadUrl = `https://hoptackinhdoanh.com/loadCompanyForPage`
    const citySlug = new URL(url).pathname.split('/').pop()
    // không có city slug trong url
    if (!citySlug) throw new Error(ErrorMessage.ERR_NO_CITY_SLUG)
    const provinceId = this._provinceSlugs.indexOf(citySlug)
    // không có slug được đăng ký, kiểm tra lại `_provinceSlugs`
    if (provinceId < 0) throw new Error(ErrorMessage.ERR_INVALID_CITY_SLUG)
    const createPaginationInfo = (
      url: string,
      page: number
    ): PaginationInfo => {
      const urlObj = new URL(url)
      urlObj.searchParams.set(SearchParams.PAGE, `${page}`)
      urlObj.searchParams.set(SearchParams.ID, `${provinceId}`)
      urlObj.searchParams.set(SearchParams.LANGUAGE, `vi`)
      urlObj.searchParams.set(SearchParams.TYPE, `company_province`)
      console.log(urlObj.toString())
      return {
        url: urlObj.toString(),
        page
      }
    }
    let current = createPaginationInfo(loadUrl, startPage)
    let next = createPaginationInfo(loadUrl, startPage + 1)
    return {
      current,
      next,
      goNext() {
        ;((current = { ...next }),
          (next = createPaginationInfo(loadUrl, current.page + 1)))
      }
    }
  }
}
