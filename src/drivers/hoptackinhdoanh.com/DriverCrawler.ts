import { ErrorMessage } from '@/constants/error.js'
import { CompanyDetail } from '@/types/common.js'
import { DriverConfig, IDriverCrawler } from '@/types/driver.js'
import * as cheerio from 'cheerio'

export class DriverCrawler implements IDriverCrawler<CompanyDetail> {
  getCompanyDetail(selector: DriverConfig['selectors'], html?: string) {
    const selectors = selector?.companyDetail
    if (!selectors) throw new Error('ERR_SELECTOR_COMPANY_DETAIL_EMPTY')
    if (!html) throw new Error(ErrorMessage.ERR_HTML_EMPTY)
    const $ = cheerio.load(html)
    const companyDetail: CompanyDetail = {
      name: $(selectors.name).text().trim(),
      address: $(selectors.address).text().trim(),
      phone: $(selectors.phone).text().trim(),
      email: $(selectors.email).text().trim(),
      taxCode: $(selectors.taxCode).text().trim(),
      founder: $(selectors.founder).text().trim(),
      primaryBusiness: $(selectors.primaryBusiness).text().trim(),
      startDate: $(selectors.startDate).text().trim()
    }
    return companyDetail
  }
  crawlLinks(html: string, selector: string): string[] | Promise<string[]> {
    if (!html) throw new Error(ErrorMessage.ERR_HTML_EMPTY)
    if (!selector) throw new Error(ErrorMessage.ERR_SELECTOR_EMPTY)
    const $ = cheerio.load(html)
    const links = $(selector)
      .map((i, el) => $(el).attr('href'))
      .get()
    return links
  }
  crawl(html: string, config: DriverConfig): CompanyDetail | Promise<CompanyDetail> {
    const companySelectors = config?.selectors?.companyDetail
    if (!companySelectors) throw new Error(ErrorMessage.ERR_SELECTOR_COMPANY_DETAIL_EMPTY)
    if (!html) throw new Error(ErrorMessage.ERR_HTML_EMPTY)
    const $ = cheerio.load(html)
    const companyDetail: CompanyDetail = {
      name: $(companySelectors.name).text().trim(),
      address: $(companySelectors.address).text().trim(),
      phone: $(companySelectors.phone).text().trim(),
      email: $(companySelectors.email).text().trim(),
      taxCode: $(companySelectors.taxCode).text().trim(),
      founder: $(companySelectors.founder).text().trim(),
      primaryBusiness: $(companySelectors.primaryBusiness).text().trim(),
      startDate: $(companySelectors.startDate).text().trim()
    }
    return companyDetail
    // return this.getCompanyDetail(config.selectors, html)
  }
}
