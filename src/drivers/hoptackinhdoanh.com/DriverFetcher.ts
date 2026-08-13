import { IDriverFetcher } from '@/types/driver.js'

export class DriverFetcher implements IDriverFetcher {
  fetch(url: string, options?: RequestInit | undefined): string | Promise<string> {
    // mặc định trả về chuỗi (áp dụng cho cào HTML), nếu fetch một Json Api thì chuyển về dạng chuỗi và chuyển đổi lại ở lớp crawler
    return fetch(url, options).then(res => res.text())
  }
}
