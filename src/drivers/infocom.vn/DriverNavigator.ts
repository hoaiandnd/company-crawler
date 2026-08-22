import { ErrorMessage } from '@/constants/error.js'
import { CrawlRequest, MayBeAsync } from '@/types/common.js'
import { IDriverNavigator, NavigatorOptions } from '@/types/driver.js'
import { isEmptyArray } from '@/utils/function.js'

export class DriverNavigator implements IDriverNavigator<string> {
  getFetchOptions(src: string, crawlRequest: CrawlRequest): MayBeAsync<NavigatorOptions<RequestInit>> {
    // url mẫu: https://tracuu-masothue.com/tracuu.php?name=0601329078&token=7ba14c434345fc8e626f17a8c56ab8c95d04620617ca03cb642983e2b0a496b6
    const urlObj = new URL(`https://tracuu-masothue.com/tracuu.php`)
    urlObj.searchParams.append('name', src)
    const token = typeof crawlRequest.tokens === 'string' ? crawlRequest.tokens : crawlRequest.tokens?.[0]
    if (!token) {
      throw new Error(ErrorMessage.ERR_REQUIRED_TOKEN_IS_MISSING)
    }
    urlObj.searchParams.append('token', token)
    return {
      url: urlObj.toString(),
      options: {
        method: 'POST'
      }
    }
  }
}
