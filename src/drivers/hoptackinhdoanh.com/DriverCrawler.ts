import { ErrorMessage } from '@/constants/error.js'
import { CompanyDetail } from '@/types/common.js'
import { DriverConfig, IDriverCrawler } from '@/types/driver.js'
import { HopTacKinhDoanhResponseSchema } from '@/types/json-schema.js'
import { toObjectMap } from '@/utils/extractor.js'
import * as cheerio from 'cheerio'
// import { writeFile } from 'fs/promises'

export class DriverCrawler implements IDriverCrawler<CompanyDetail> {
  async crawlLinks(jsonText: string, selector: string): Promise<string[]> {
    if (!jsonText) throw new Error(ErrorMessage.ERR_HTML_EMPTY)
    if (!selector) throw new Error(ErrorMessage.ERR_SELECTOR_EMPTY)
    const jsonParseResult = HopTacKinhDoanhResponseSchema.safeParse(
      JSON.parse(jsonText)
    )
    if (!jsonParseResult.success) {
      console.log(
        'RESPONSE PARSE ERROR MESSAGE',
        jsonParseResult.error?.message
      )
      throw new Error(ErrorMessage.ERR_REPONSE_CANNOT_PARSE)
    }
    const links = Object.values(jsonParseResult.data.content).map(html => {
      const $ = cheerio.load(html)
      const link = $('a').attr('href') ?? ''
      return `https://hoptackinhdoanh.com${link}`
    })
    return links || []
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
      // 'email',
      'taxCode',
      'founder',
      'primaryBusiness',
      'startDate'
    )
    const result = {
      ...objectMap,
      phone: $(companySelectors.phone).attr('data-phone-full') ?? '',
      email: $(companySelectors.email).attr('data-email-full') ?? ''
    }
    console.log(`> CRAWLED ${result.name} - ${result.phone}`)
    return result
  }
}
