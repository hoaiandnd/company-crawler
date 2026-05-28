import { CompanyDetail } from '@/types/common.js'
import { DriverConfig, IDriverCrawler } from '@/types/driver.js'
import * as cheerio from 'cheerio'

export class DriverCrawler implements IDriverCrawler<CompanyDetail> {
  crawlLinks(html: string, selector: string): string[] | Promise<string[]> {
    if(html === '') throw new Error('ERR_HTML_EMPTY')
    if(selector === '') throw new Error('ERR_SELECTOR_EMPTY')
    const $ = cheerio
    throw new Error('Method not implemented.')
  }
  crawl(html: string, config: DriverConfig): CompanyDetail | Promise<CompanyDetail> {
    throw new Error('Method not implemented.')
  }
}
