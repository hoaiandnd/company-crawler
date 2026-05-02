import { CompanyDetail } from '@/types/common.js'
import { DriverConfig, IDriverCrawler } from '@/types/driver.js'

export class DriverCrawler implements IDriverCrawler<CompanyDetail> {
  crawlLinks(html: string, selector: string): string[] | Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  crawl(html: string, config: DriverConfig): CompanyDetail | Promise<CompanyDetail> {
    throw new Error('Method not implemented.')
  }
}
