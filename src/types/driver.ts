import { CrawlRequest } from '@/types/common.js'
import { DriverConfigSchema } from '@/types/json-schema.js'
import z from 'zod'

export type ValidRequestResult = {
  isValid: true
  transform: () => CrawlRequest
}
export type InvalidRequestResult = {
  isValid: false
}
export type RequestValidateResult = ValidRequestResult | InvalidRequestResult

export interface IRequestHandler {
  validate: () => RequestValidateResult | Promise<RequestValidateResult>
}

type SuccessCrawlResult = {
  isFinish: true
  exportedFileName: string
}
type FailedCrawlResult = {
  isFinish: false
  error?: Error
}
export type CrawlResult = (SuccessCrawlResult | FailedCrawlResult) & {
  lastPage: number // trang cuối cùng cào dữ liệu (thành công hoặc thất bại)
}

export type DriverConfig = z.infer<typeof DriverConfigSchema>

export interface IDriverConfigurationLoader {
  load(domain: string): Promise<DriverConfig>
}

export type DriverContext = {
  crawlRequest?: CrawlRequest
  driverConfig?: DriverConfig
}

type FileMode = 'append' | 'create'
export type ExportOptions<TData> = {
  fileName?: string
  mode?: FileMode
  transformFn?: <TTransformedData>(data: TData) => TTransformedData
  // các thuộc tính cấu hình khác - phát triển sau
}
