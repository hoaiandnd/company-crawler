import { IDriverFetcher } from '@/types/driver.js'

export class DriverFetcher implements IDriverFetcher {
  fetch(url: string, options?: RequestInit | undefined): string | Promise<string> {
    return fetch(url, options).then(res => res.text())
  }
}
