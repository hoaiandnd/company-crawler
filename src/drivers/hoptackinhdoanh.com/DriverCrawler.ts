import { ErrorMessage } from '@/constants/error.js'
import { CompanyDetail } from '@/types/common.js'
import { DriverConfig, IDriverCrawler } from '@/types/driver.js'
import { toTextMap } from '@/utils/extractor.js'
import * as cheerio from 'cheerio'

export class DriverCrawler implements IDriverCrawler<CompanyDetail> {
  crawlLinks(html: string, selector: string): string[] | Promise<string[]> {
    if (!html) throw new Error(ErrorMessage.ERR_HTML_EMPTY)
    if (!selector) throw new Error(ErrorMessage.ERR_SELECTOR_EMPTY)
    const $ = cheerio.load(html)
    const links = $(selector)
      .map((i, el) => $(el).attr('href'))
      .get()
    return links
  }
  crawl(
    html: string,
    config: DriverConfig
  ): CompanyDetail | Promise<CompanyDetail> {
    const companySelectors = config?.selectors?.companyDetail
    if (!companySelectors)
      throw new Error(ErrorMessage.ERR_SELECTOR_COMPANY_DETAIL_EMPTY)
    if (!html) throw new Error(ErrorMessage.ERR_HTML_EMPTY)
    const $ = cheerio.load(html)
    const textMap = toTextMap($, companySelectors)
    const companyDetail: CompanyDetail = {
      name: textMap.get('name'),
      address: textMap.get('address'),
      phone: textMap.get('phone'),
      email: textMap.get('email'),
      taxCode: textMap.get('taxCode'),
      founder: textMap.get('founder'),
      primaryBusiness: textMap.get('primaryBusiness'),
      startDate: textMap.get('startDate')
    }
    return companyDetail
  }
}
