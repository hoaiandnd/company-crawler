import { CrawlRequest, MayBeAsync } from '@/types/common.js'
import { DriverConfigSchema, ExporterOptionsSchema } from '@/types/json-schema.js'
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
  crawlRequest: CrawlRequest
  driverConfig: DriverConfig
}

type FileMode = 'append' | 'create'
export type ExportOptions<TData> = {
  fileName?: string
  mode?: FileMode
  transformFn?: (data: TData) => unknown
  // các thuộc tính cấu hình khác - phát triển sau
}

export type PaginationInfo = {
  url: URL // url đến trang được chỉ định - có thể sử dụng ngay
  page: number // chỉ số trang được xét - đồng bộ với `url`
}
export type PaginationResult = {
  current: PaginationInfo // trang hiện tại - dùng trực tiếp để fetch
  next: PaginationInfo // trang tiếp theo - dùng khi kết thúc fetch
}

export type DriverComponent<TCrawlData, TFetchOptions> = {
  paginator: IDriverPaginator
  fetcher: IDriverFetcher<TFetchOptions>
  crawler: IDriverCrawler<TCrawlData>
  exporters?: IDriverExporter[]
  validator?: IDriverValidator<TCrawlData>
}

export interface IDriverPaginator {
  paginate(context: DriverContext): PaginationResult | Promise<PaginationResult>
  goNext(page: PaginationResult): PaginationResult | Promise<PaginationResult>
}

export interface IDriverFetcher<TFetchOptions = RequestInit> {
  fetch(url: string, options?: TFetchOptions): string | Promise<string>
}

export interface IDriverCrawler<T> {
  // cào các link đến các trang chi tiết
  crawlLinks(html: string, selector: string): string[] | Promise<string[]>
  // cào thông tin chi tiết
  crawl(html: string, config: DriverConfig): T | Promise<T>
}

export interface IDriverValidator<T> {
  validate(context: DriverContext, data: T): boolean | Promise<boolean>
}

export type ExporterOptions<T> = Omit<ExportOptions<T>, 'transformFn'>
export interface IDriverExporter {
  canHandle(format: string): boolean
  export<T = any>(data: T[], options?: ExporterOptions<T>, config?: DriverConfig): void | Promise<void>
  // một số trình ghi file phải có thao tác đóng luồng hoặc tương tự, hãy định nghĩa trong phương thức `close()`.
  close(): void | Promise<void>
}

export type DriverExporterOptions = z.infer<typeof ExporterOptionsSchema>
export type NavigatorOptions<TOptions> = {
  url: string
  options?: TOptions
}
export interface IDriverNavigator<TSourceCrawlData, TFetchOptions = RequestInit> {
  getFetchOptions(src: TSourceCrawlData): MayBeAsync<NavigatorOptions<TFetchOptions>>
}
export interface ISourceDriverCrawler<TSourceCrawlData> {
  crawls(html: string, config: DriverConfig): MayBeAsync<TSourceCrawlData[]>
}
export interface ITargetDriverCrawler<TTargetCrawlData> {
  crawl(html: string, config: DriverConfig): MayBeAsync<TTargetCrawlData>
}
// Combined driver
/**
 * Type for the component that combines source and target crawling logic
 * `TSourceCrawlData` is the type of data crawled from the source pages, used for navigator to determine the next fetch options.
 */
export type CombinedSourceDriverComponent<TSourceCrawlData, TCrawlData, TFetchOptions> = Omit<DriverComponent<TCrawlData, TFetchOptions>, 'crawler'> & {
  sourceCrawler: ISourceDriverCrawler<TSourceCrawlData>
  targetCrawler: ITargetDriverCrawler<TCrawlData>
  navigator: IDriverNavigator<TSourceCrawlData, TFetchOptions>
}

export type LimitPage = number
export type FromPage = number
export type ToPage = number
