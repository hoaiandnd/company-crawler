import { ErrorMessage } from '@/constants/error.js'
import { CompanyDetail, MayBeAsync } from '@/types/common.js'
import { DriverConfig, ITargetDriverCrawler } from '@/types/driver.js'
import { splitPair, toObjectMap } from '@/utils/extractor.js'
import * as cheerio from 'cheerio'

export class TargetDriverCrawler implements ITargetDriverCrawler<CompanyDetail> {
  crawl(html: string, config: DriverConfig): MayBeAsync<CompanyDetail> {
    const companySelectors = config?.selectors?.companyDetail
    if (!companySelectors) throw new Error(ErrorMessage.ERR_SELECTOR_COMPANY_DETAIL_EMPTY)
    if (!html) throw new Error(ErrorMessage.ERR_HTML_EMPTY)
    const $ = cheerio.load(html)
    const getTargetSelector = (selectorKey: keyof typeof companySelectors) => {
      try {
        const targetSelectorIndex = 1
        return splitPair(companySelectors[selectorKey] ?? '')[targetSelectorIndex]
      } catch {
        return ''
      }
    }
    const getTargetText = (selectorKey: keyof typeof companySelectors) => {
      const selector = getTargetSelector(selectorKey)
      return $(selector).text()
    }
    return {
      name: getTargetText('name'),
      founder: getTargetText('founder'),
      taxCode: getTargetText('taxCode'),
      address: getTargetText('address'),
      startDate: getTargetText('startDate'),
      primaryBusiness: getTargetText('primaryBusiness'),
      phone: getTargetText('phone'),
      email: getTargetText('email')
    }
  }
}
