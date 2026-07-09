# Mô tả tool cào dữ liệu thông tin công ty

## Công nghệ sử dụng:

- **Express.js**: Sử dụng làm server
- **TypeScript**: Khai báo & định nghĩa các kiểu dữ liệu chặt chẽ so với việc sử dụng JavaScript thông thường
- **Cheerio API**: "Query" dữ liệu từ chuỗi HTML tải về
- **Fetch API**: Request để lấy dữ liệu HTML/Json

> [!Note]
> Đối với Express.js, ứng dụng không được phép phụ thuộc vào cấu trúc ứng dụng. Vì vậy, ứng dụng sẽ chỉ quan tâm đối tượng `express.Request` truyền vào hệ thống. Bên trong hệ thống sẽ độc lập với bên ngoài.

## Cấu trúc ứng dụng

- `RequestHandler`: xử lý các logic khi nhận đối tượng `express.Request`:
  - `RequestValidator`: Validate request.
  - `RequestExtractor`: Sau khi được validate, trích xuất thông tin từ đối tượng `express.Request` ra thành các thông tin sử dụng cho hệ thống.
- `DriverLoader`: tải driver cụ thể tương ứng với trang web cần cào (mỗi trang web cần phải khai báo một driver chỉ ra cách cào dữ liệu từ trang đó).

Mỗi driver sẽ bao gồm:

- `DriverConfigurationLoader`: tải file cấu hình tương ứng với từng driver. File cấu hình sẽ chứa các thông tin như: tên hiển thị, tên miền, định dạng hỗ trợ export, các selector lấy dữ liệu, blacklist, ...
- `DriverPaginator`: quản lý việc xác định đường dẫn phân trang. Xác định đường dẫn sẽ bắt đầu cào và cách chuyển sang trang tiếp theo (hoặc trang cụ thể).
- `DriverFetcher`: chứa các logic chính trong việc cào dữ liệu. Bao gồm cào các đường dẫn ở trang tổng, và cào trên từng trang chi tiết.
- `DriverCrawler`: xác định dữ liệu từ đoạn HTML/JSON cào được từ `DriverFetcher`.
- `DriverValidator`: xác định dữ liệu lấy được có thõa mãn các điều kiện lọc từ request hoặc blacklist hay không, lọc ra.
- `DriverExporter`: chỉ ra cách export dữ liệu cào được. Ở bước này cho phép thay đổi dữ liệu sẽ export.

## Request handler

Cách sử dụng:

```ts
app.post(async (req, res, next) => {
  const requestHandler = new RequestHandler(req)
  const result = await requestHandler.validate()
  if (!result.isValid) {
    throw new Error('ERR_INVALID_REQUEST')
    return
  }
  const request = result.transform()
  // code ...
})
```

Các kiểu dữ liệu cần định nghĩa:

- Interface `IRequestHandler`:

```ts
export interface IRequestHandler {
  validate: () => RequestValidateResult | Promise<RequestValidateResult>
}
```

- Kiểu `RequestValidateResult` dành cho phương thức `IRequestHandler.validate()`:

```ts
export type ValidRequestResult = {
  isValid: true
  transform: () => CrawlRequest
}
export type InvalidRequestResult = {
  isValid: false
}
export type RequestValidateResult = ValidRequestResult | InvalidRequestResult
```

- Kiểu `CrawlRequest` là được trả về thông qua hàm `transform()` chứa các thông tin mà hệ thống sẽ dựa vào đó để cào dữ liệu. Khi đã có `CrawlRequest` thì hệ thống sẽ không phụ thuộc vào `express.Request` nữa.

```ts
export type ExportFormat = 'docx' | 'csv' | 'txt' | 'xlsx'
export type CrawlRequest = {
  url: string
  exportFormat?: ExportFormat
  filters?: CrawlFilter
}
export type CrawlFilterRange<T> = {
  from?: T
  to?: T
}
export type CrawlFilter = {
  page?: CrawlFilterRange<number>
  limit?: number
  date?: CrawlFilterRange<number | string>
}
```

## Driver loader

Driver loader sẽ dựa vào domain (xác định từ thuộc tính `CrawlRequest.url`) để xem domain có được đăng ký driver để cào dữ liệu hay không. Nếu có driver được đăng ký sẽ thực hiện tải driver đó để thực hiện cào dữ liệu.

Sử dụng:

```ts
const driver = DriverLoader.load('domain')
if (!driver) {
  throw new Error('ERR_UNSUPPORTED_DOMAIN')
}
// code ...
```

Phương thức `load()` trả về instance của lớp `Driver` cụ thể.

```ts
export type DriverMap = {
  [domain: string]: Driver
}
export class DriverLoader {
  static drivers: DriverMap = {
    'domain-a': new DriverA(),
    'domain-b': new DriverB()
  }
  public static load(domain: string): Driver {
    return DriverLoader.drivers[domain]
  }
}
```

Lớp `Driver` là lớp cơ sở (lớp cha) cho các lớp driver cụ thể. Lớp cơ sở này cung cấp duy nhất một phương thức `public` là `crawl()` với cách sử dụng sau:

```ts
app.post(async (req, res) => {
  const requestHandler = new RequestHandler(req)
  const result = await requestHandler.validate()
  if (!result.isValid) {
    throw new Error('ERR_INVALID_REQUEST')
    return
  }
  const crawlRequest = result.transform()
  // hàm tiện ích `getDomain()` dùng để xác định domain từ url
  const domain = getDomain(crawlRequest.url)
  const driver = DriverLoader.load(domain)
  if (!driver) {
    throw new Error('ERR_UNSUPPORTED_DOMAIN')
    return
  }
  const crawlResult = await driver.crawl(crawlRequest).export({
    fileName: 'company-src-1.csv',
    transformFn: (data) => {
      return { data.name, data.phone }
    }
  })
  // code ...
})
```

Phương thức `export()` (từ phương thức `crawl()`) sẽ trả về kiểu `CrawlResult`:

```ts
export type SuccessCrawlResult = {
  isFinish: true
  exportedFileName: string
}
export type FailedCrawlResult = {
  isFinish: false
  error?: Error
}
export type CrawlResult = (SuccessCrawlResult | FailedCrawlResult) & {
  lastPage: number // trang cuối cùng cào dữ liệu (thành công hoặc thất bại)
}
```

## Driver

Lớp `Driver` là lớp cơ sở trừu tượng cho các driver cụ thể.

```ts
export type DriverContext = {
  crawlRequest?: CrawlRequest
  driverConfig?: DriverConfig // xem mục # Driver Configuration Loader
}

export abstract class Driver<TData = any> {
  protected _context?: DriverContext
  construction() {
    this._context = undefined
  }
  protected abstract _run(exportOptions?: ExportOptions<TData>): CrawlResult | Promise<CrawlResult>
  public crawl(crawlRequest: CrawlRequest) {
    if (!crawlRequest) {
      throw new Error('ERR_NO_REQUEST_DATA')
    }
    this._context = { crawlRequest }
    return this
  }
  public export(exportOptions?: ExportOptions<TData>) {
    return this._run(exportOptions)
  }
}
```

Trong đó, kiểu `ExportOptions` có dạng như sau:

```ts
export type FileMode = 'append' | 'create'
export type ExportOptions<TData> = {
  fileName?: string
  mode?: FileMode
  transformFn?: <TTransformedData>(data: TData) => TTransformedData
  // các thuộc tính cấu hình khác - phát triển sau
}
```

> [!Important]
> Thuộc tính `Driver._context.crawlRequest` sẽ tự có giá trị khi gọi `crawl()`. Các lớp driver kế thừa chỉ cần định nghĩa phương thức `_run()`. Phương thức `_run()` sẽ chỉ cần quan tâm đến các điều kiện lọc, nơi gọi các phương thức khác.

**Ví dụ:**

```ts
export type DriverComponent<TCrawlData, TFetchOptions> = {
  configLoader: IDriverConfigurationLoader
  paginator: IDriverPaginator
  fetcher: IDriverFetcher<TFetchOptions>
  crawler: IDriverCrawler<TCrawlData>
  exporters?: IDriverExporter[]
  validator?: IDriverValidator<TCrawlData>
}

export class DriverBase<TCrawlData extends { phone: string }, TFetchOptions = RequestInit> extends Driver<TCrawlData> {
  protected readonly _components: DriverComponent<TCrawlData, TFetchOptions>
  constructor(components: DriverComponent<TCrawlData, TFetchOptions>) {
    super()
    this._components = components
  }
  protected _setFetchQueue(companyLinks: string[]) {
    const limiter = pLimit(this._context.driverConfig.crawlLimit)
    const fetchQueue = companyLinks.map(url =>
      limiter(async _ => {
        const html = await this._components.fetcher.fetch(url)
        const companyDetail = await this._components.crawler.crawl(html, config)
        const isValid = await this._components.validator?.validate(companyDetail)
        return isValid ? companyDetail : null
      })
    )
    return Promise.all(fetchQueue)
  }
  protected async _run(exportOptions?: ExportOptions): Promise<CrawlResult> {
    // sử dụng các thành phần đề tạo thành một chức năng hoàn chỉnh
    const { configLoader, paginator, fetcher, crawler, exporter } = this._components
    const { url, filters { limit } } = this._context.crawlRequest
    const crawlDomain = getDomain(url)
    // load and save driver configurations
    this._context.driverConfig = await configLoader.load(crawlDomain)
    let crawlLimit = (limit && limit > 0) ? limit : this._context.driverConfig.crawlLimit
    const paginator = paginator.paginate(this._context.crawlRequest)

    while (crawlLimit >= 0) {
      await waitRandom()

      const html = await fetcher.fetch(paginator.current.url)
      const companyLinks = await crawler.crawlLinks(html, this._context.driverConfig.selector.companyLink)

      const companies = await this._setFetchQueue(companyLinks)

      //  transform `companies` before exporting ...

      paginator.goNext()
      crawlLimit--
    }
  }
}
```

## Driver Configuration Loader

Mỗi driver sẽ có một file JSON để cấu hình cho từng domain. Driver Configuration Loader sẽ có nhiệm vụ tải file JSON đó để tải những cấu hình cụ thể.

File cấu hình sẽ có các thuộc tính như sau:

```json
{
  "name": "Page name",
  "domain": "domain.com",
  "supportedExportFormats": ["docx", "csv"],
  "crawlLimit": 10,
  "concurrencyRequestLimit": 5,
  "dateFormat": "YYYY-MM-DD",
  "selectors": {
    "companyLinks": "body > div > a",
    "companyDetail": {
      "name": "body > div.name",
      "phone": "body > div.phone",
      "taxCode": "body > div.taxCode",
      "address": "body > div.address",
      "founder": "body > div.founder",
      "startDate": "body > div.startDate",
      "email": "body > div.email",
      "primaryBusiness": "body > div.primary-business"
    }
  },
  "blackList": {
    "name": {
      "rules": ["văn phòng đại diện", "Ủy ban", "ubnd", "công an", "massage", "ntnn"],
      "validateType": "includes",
      "ignoreCase": true
    },
    "phone": {
      "rules": ["02"],
      "validateType": "startsWith",
      "ignoreCase": true
    }
  }
}
```

Vì cấu trúc file JSON là giống nhau, Driver Configuration Loader có thể sử dụng chung theo nguyên mẫu interface sau:

```ts
export interface IDriverConfigurationLoader {
  load(domain: string): Promise<DriverConfig>
}
```

Trong đó:

- `DriverConfiguration` là kiểu đối tượng của toàn file cấu hình.

- Tham số `domain` sẽ lấy từ `CrawlRequest.url`.

> [!Note]
> Các lớp triển khai interface `IDriverConfigurationLoader` có thể sử dụng thêm các công cụ kiểm tra JSON (ở đây sử dụng [`zod`](https://www.npmjs.com/package/zod)).

Bảng mô tả file JSON cấu hình cho driver:

| Thuộc tính                | Kiểu dữ liêu             | Mô tả                                                                                           | Giá trị mặc định  |
| ------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------- | ----------------- |
| `name`                    | `string`                 | Tên của driver. Thường là tên trang web tương ứng với tên miền. Dùng cho các mục đích hiển thị. | `''` (Chuỗi rỗng) |
| `domain`                  | `string`                 | Tên miền của trang website mà driver được định nghĩa để cào.                                    | **Required**      |
| `supportedExportFormat`   | `string[]`               | Định dạng mà driver hiện tại hỗ trợ                                                             | `[]`              |
| `crawlLimit`              | `number`                 | Giới hạn cào của driver. Nếu không có điều kiện dừng nào, giá trị này sẽ được sử dụng rồi.      | `10`              |
| `concurrencyRequestLimit` | `number`                 | Giới hạn số request được chạy đồng thời                                                         | `undefined`       |
| `dateFormat`              | `string`                 | Định dạng ngày giờ mà driver xử lý.                                                             | `'YYYY-MM-DD'`    |
| `selectors`               | `Record<string, string>` | CSS Selector để tìm đến các thành phần cần cào.                                                 | `{}`              |
| `blackList`               | `Array<BlackListItem>`   | Danh sách đen. Quy định bởi các thuộc tính `rules`, `validateType` và `ignoreCase`.             | `undefined`       |

Ta sẽ sử dụng `zod` để kiểm tra file JSON cấu hình có hợp lệ hay không.

```ts
import z from 'zod'

export const CompanyDetailSchema = z.object({
  name: z.string().optional(),
  founder: z.string().optional(),
  taxCode: z.string().optional(),
  phone: z.string().length(10),
  address: z.string().optional(),
  startDate: z.string().optional(),
  email: z.string().email().optional(),
  primaryBusiness: z.string().optional()
})

export const SelectorSchema = z.object({
  companyLinks: z.string(),
  companyDetail: CompanyDetailSchema
})

export const RuleSchema = z.object({
  rules: z.array(z.string()),
  validateType: z.enum(['includes', 'startsWith', 'endsWith']),
  ignoreCase: z.boolean().optional().default(false)
})

export const BlackListSchema = z.record(CompanyDetailSchema.keyof(), RuleSchema.optional())

export const DriverConfigSchema = z.object({
  name: z.string().optional().default(''),
  domain: z.string(),
  dateFormat: z.string().default('YYYY-MM-DD'),
  supportedExportFormats: z.array(z.string()),
  crawlLimit: z.number().int().positive().default(10),
  concurrencyRequestLimit: z.number().int().positive().default(5),
  selectors: SelectorSchema.optional(),
  blackList: BlackListSchema.optional()
})
```

> [!Important]
> Driver Configuration Loader phải có nhiệm vụ đảm bảo các giá trị cho **tất cả** thuộc tính cấu hình. Nếu không có giá trị, hãy khởi tạo nó với giá trị mặc định như đã mô tả.

## Driver Paginator

Request nhận vào đối tượng kiểu `CrawlRequest` có thuộc tính `url` và `filter.page.from` và `filter.page.to`.

Driver Paginator dùng để chỉ ra cách chuyển trang khi biết được trang hiện tại. Kết quả trả về kiểu `PaginationResult`:

```ts
export type PaginationInfo = {
  url: string // url đến trang được chỉ định - có thể sử dụng ngay
  page: number // chỉ số trang được xét - đồng bộ với `url`
}
export type PaginationResult = {
  current: PaginationInfo // trang hiện tại - dùng trực tiếp để fetch
  next: PaginationInfo // trang tiếp theo - dùng khi kết thúc fetch
  goNext: () => void | Promise<void> // thay đổi `current` và `next` của object hiện tại
}
```

Interface `IDriverPaginator` có mẫu như sau:

```ts
export interface IDriverPaginator {
  paginate(context: DriverContext): PaginationResult | Promise<PaginationResult>
}
```

> [!Warning]
> Phương thức `goNext()` sẽ thực hiện tính toán thay đổi giá trị của thuộc tính `current` và `next`. Hãy gọi nó một cách có chủ ý và thường là cuối thao tác duyệt trang và di chuyển sang trang mới.
>
> **Ví dụ:**
>
> ```ts
> let { crawlLimit } = this._context.driverConfig ?? DEFAULT_CRAWL_LIMIT
> const paginator = this._component.paginator.paginate(this._context.crawlRequest)
> while (crawlLimit) {
>   const { url } = paginator.current
>   const html = await this._component.fetcher.fetch(url)
>   // xử lý ...
>   paginator.goNext() // gọi cuối cùng xử lý trang mới
>   crawlLimit--
> }
> ```

## Driver Fetcher

Driver Fetcher có nhiệm vụ cung cấp một phương thức có thể lấy dữ liệu từ một đường dẫn cụ thể - thường lấy từ `PaginationResult.current.url`.

Kết quả fetch được có thể chia làm 2 loại:

- HTML
- JSON

> [!Note]
> Mặc dù các trường hợp cào dữ liệu sẽ trả về dạng HTML, nhưng vẫn phải triển khai thêm dữ liệu dạng JSON, nhằm mục đích mở rộng.

> [!Warning]
> Để đồng bộ tiến đến Driver Crawler, nếu dữ liệu trả về là **JSON**, hãy chuyển nó về **dạng chuỗi** với `JSON.stringify()`.

Interface `IDriverFetcher` đại diện cho thao tác lấy dữ liệu từ đường dẫn:

```ts
export interface IDriverFetcher<TFetchOptions = RequestInit>
  fetch(url: string, options?: TFetchOptions): string | Promise<string>
}
```

Kiểu `RequestInit` là tham số cấu hình cho hàm `fetch(resource, options)` trong Fetch API.

Thay đổi `TFetchOption` nếu sử dụng cách thức gọi API khác ngoài Fetch API (ví dụ: `axios`)

## Driver Crawler

Driver Crawler có nhiệm vụ từ chuỗi (HTML hoặc JSON), chuyển đổi về kiểu đối tượng định sẵn sử dụng được trong JavaScript.

Với dạng HTML, ở đây sử dụng [**Cheerio**](https://www.npmjs.com/package/cheerio) để lấy dữ liệu từ các selector định sẵn trong file cấu hình driver.

```ts
import * as cheerio from 'cheerio'

const $ = cheerio.load('<h2 class="title">Hello world</h2>')
const text = $('.title').first().text() // Hello world
```

Interface `IDriverCrawler` sẽ có dạng như sau:

```ts
export interface IDriverCrawler<T> {
  // cào các link đến các trang chi tiết
  crawlLinks(html: string, selector: string): string[] | Promise<string[]>
  // cào thông tin chi tiết
  crawl(html: string, config: DriverConfig): T | Promise<T>
}
```

## Driver Validator

Driver Validator dùng để kiểm tra xem một thông tin cào được có hợp lệ hay không dựa trên `CrawlRequest.filters` và thuộc tính `DriverConfig.blackList`.

Interface `IDriverValidator` sẽ có dạng như sau:

```ts
export interface IDriverValidator<T> {
  validate(context: DriverContext, data: T): boolean | Promise<boolean>
}
```

## Transformer và Exporter

Chiến lược export sẽ là xuất file theo từng batch. Vì lý do lấy dữ liệu theo từng batch nhỏ chứ không phải để dữ liệu dồn toàn bộ vào một list, do đó sẽ không có tùy chọn trả về theo response.

Có rất nhiều định dạng file có thể export như `.docx`, `.txt`, `.csv`, `xlsx`, ... nên exporter cho một driver cho phép inject nhiều export service.

Các export service không được phép phụ thuộc vào định dạng của dữ liệu truyền vào. Chỉ cần quan tâm dữ liệu truyền vào sẽ có dạng mảng `TData[]`.

Một export service phải triển khai interface `IDriverExporter` như sau:

```ts
export type DriverExporterOptions = Omit<ExportOptions, 'transformFn'>
export interface IDriverExporter {
  canHandle: (format: string) => boolean
  export: <T = any>(data: T[], options: DriverExporterOptions) => void | Promise<void>
}
```

> [!Note]
> Thuộc tính `transformFn` sẽ được lấy ra khỏi `ExportOptions` để thực hiện chuyển đổi dữ liệu trước khi đưa vào phương thức `export()`. Exporter service chỉ cần quan tâm đến cách để xuất thành file, không quan tâm đến dữ liệu ra sao.

Mỗi driver sẽ khai báo đăng ký các export service cho riêng driver đó. Tuy vậy, có thể định nghĩa để sử dụng chung cho nhiều driver.

Phương thức `canHandle()` dùng để xác định export driver nào có thể xử lý được một định dạng file nhất định.

**Ví dụ:**

```ts
const exporter = this._components.exporters.find(e => e.canHandle('.docx'))
if(!exporter) {
  throw new Error('ERR_FORMAT_CANNOT_HANDLE')
  return  
}
await exporter.export(data)
// code ...
```

Driver sẽ khai báo sử dụng service tương ứng thông qua phương thức `registerExporters()` sẽ định nghĩa trong `DriverBase`.

```ts
export class DriverBase<TCrawlData extends { phone: string }, TFetchOptions = RequestInit> extends Driver {
  // các thành phần khác ...
  public registerExporters(exporters?: IDriverExporter[]) {
    this._components.exporters = exporters
    return this
  }
}
```

## Xử lý ngoại lệ - Exception Handling

Với tư tưởng:

- Không phụ thuộc vào hệ thống bên ngoài (framework, library, ...).
- Các kiểu dữ liệu sẽ không mang tính tùy chọn `T | undefined | null`.

Do đó, các phương thức nếu gặp trường hợp ngoại lệ, hãy ném ra một `Error`.

Các lỗi bị ném ra từ các thành phần sẽ được xử lý tập trung tại phương thức `Driver._run()` mà không cần quan tâm đến lớp xử lý exception của hệ thống bên ngoài.

Các ngoại lệ đều có tên bắt đầu bằng tiền tố `ERR_`.

"exporterOptions": {
    "txt": {
      "propertyDelimiter": "\n",
      "itemDelimiter": "\n"
    },
    "xlsx": {
      "sheetName": "Sheet 1",
      "columnHeadersMap": {
        "name": "Tên công ty",
        "phone": "Số điện thoại",
        "taxCode": "Mã số thuế",
        "address": "Địa chỉ",
        "founder": "Chủ sở hữu",
        "startDate": "Ngày thành lập",
        "email": "Email",
        "primaryBusiness": "Ngành nghề chính"
      }
    }
  }

  "address": {
      "rules": ["vũng tàu","xuân lộc", "vĩnh cửu", "tân phú", "bình phước", "cẩm mỹ", "long khánh", "long thành", "nhơn trạch"],
      "validateType": "includes",
      "ignoreCase": true
    }