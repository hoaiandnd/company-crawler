import { CompanyDetail } from '@/types/common.js'
import { DriverConfig, IDriverCrawler } from '@/types/driver.js'
import * as cheerio from 'cheerio'

export class DriverCrawler implements IDriverCrawler<CompanyDetail> {
  getCompanyDetail(selector: DriverConfig['selectors'], html?: string) {
    const selectors = selector?.companyDetail
  }
  crawlLinks(html: string, selector: string): string[] | Promise<string[]> {
    if (html === '') throw new Error('ERR_HTML_EMPTY')
    if (selector === '') throw new Error('ERR_SELECTOR_EMPTY')
    const $ = cheerio.load(html)
    const links = $(selector)
      .map((i, el) => $(el).attr('href'))
      .get()
    return links
  }
  crawl(html: string, config: DriverConfig): CompanyDetail | Promise<CompanyDetail> {
    const selectors = config.selectors?.companyDetail
    const $ = cheerio.load(html)
    for (const key in selectors) {
      const selector = selectors?.[key as keyof typeof selectors]
      const value = $(selector).text().trim()
      if(value) {

      }
    }
    throw new Error('Method not implemented.')
  }
}
