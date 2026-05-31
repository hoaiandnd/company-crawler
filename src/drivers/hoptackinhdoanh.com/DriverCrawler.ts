import { ErrorMessage } from '@/constants/error.js'
import { CompanyDetail } from '@/types/common.js'
import { DriverConfig, IDriverCrawler } from '@/types/driver.js'
import { cheerioText } from '@/utils/extractor.js'
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
    const text = cheerioText($, companySelectors)
    const companyDetail: CompanyDetail = {
      name: text.get('name'),
      address: text.get('address'),
      phone: text.get('phone'),
      email: text.get('email'),
      taxCode: text.get('taxCode'),
      founder: text.get('founder'),
      primaryBusiness: text.get('primaryBusiness'),
      startDate: text.get('startDate')
    }
    return companyDetail
  }
}
