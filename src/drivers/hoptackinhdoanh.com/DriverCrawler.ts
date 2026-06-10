import { ErrorMessage } from '@/constants/error.js'
import { CompanyDetail } from '@/types/common.js'
import { DriverConfig, IDriverCrawler } from '@/types/driver.js'
import { toObjectMap } from '@/utils/extractor.js'
import * as cheerio from 'cheerio'
import { writeFile } from 'fs/promises'

export class DriverCrawler implements IDriverCrawler<CompanyDetail> {
  async crawlLinks(html: string, selector: string): Promise<string[]> {
    await writeFile('./html.log.txt', html, 'utf8')
    if (!html) throw new Error(ErrorMessage.ERR_HTML_EMPTY)
    if (!selector) throw new Error(ErrorMessage.ERR_SELECTOR_EMPTY)
    const $ = cheerio.load(html)
    const links = $(selector)
      .map((_, el) => $(el).attr('href'))
      .get()
    console.log('DriverCrawler:crawlLinks [Fn]: ', links.length)
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
    const objectMap = toObjectMap(
      $,
      companySelectors,
      'name',
      'address',
      // 'phone',
      'email',
      'taxCode',
      'founder',
      'primaryBusiness',
      'startDate'
    )
    console.log(objectMap['name'])
    return {
      ...objectMap,
      phone: $(companySelectors.phone).attr('data-phone-full') ?? ''
    }
  }
}
