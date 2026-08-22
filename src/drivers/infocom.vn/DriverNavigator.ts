import { CompanyDetail, MayBeAsync } from '@/types/common.js'
import { IDriverNavigator, NavigatorOptions } from '@/types/driver.js'

export class DriverNavigator implements IDriverNavigator<string> {
  getFetchOptions(src: string): MayBeAsync<NavigatorOptions<RequestInit>> {
    // request url: https://tracuu-masothue.com/tracuu.php?name=0601329078&token=7ba14c434345fc8e626f17a8c56ab8c95d04620617ca03cb642983e2b0a496b6
    const url = `https://tracuu-masothue.com/tracuu.php`
    const urlObj = new URL(url)
    urlObj.searchParams.append('name', src)
    throw new Error('Method not implemented.')
  }
}
