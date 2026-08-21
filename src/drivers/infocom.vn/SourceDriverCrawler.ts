import { MayBeAsync } from '@/types/common.js'
import { DriverConfig, ISourceDriverCrawler } from '@/types/driver.js'
import { splitPair } from '@/utils/extractor.js'
import * as cheerio from 'cheerio'

export class SourceDriverCrawler implements ISourceDriverCrawler<string> {
  crawls(html: string, config: DriverConfig): MayBeAsync<string[]> {
    const { selectors } = config
    if (!selectors) return []
    const sourceTaxCodeSelector = splitPair(selectors?.companyDetail.taxCode)[0]
    const $ = cheerio.load(html)
    const taxCodeList = $(sourceTaxCodeSelector)
    if (taxCodeList.length > 0) {
      return taxCodeList.map((_, el) => $(el).text()).get()
    }
    return []
  }
}
