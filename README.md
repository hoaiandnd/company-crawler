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
- `DriverTransformer`: chỉ ra dữ liệu sẽ được chuyển đổi như thế nào làm output.

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

Lớp `Driver` là lớp cơ sở (lớp cha) cho các lớp driver cụ thể. Lớp cơ sở này cung cấp duy nhất một phương thức ra ngoài là phương thức `crawlAndExport()` với cách sử dụng sau:

```ts
app.post(async (req, res, next) => {
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
  const crawlResult = await driver.crawlAndExport(crawlRequest)
  // code ...
})
```

Phương thức `crawlAndExport()` trả về kiểu `CrawlResult`:

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
export abstract class Driver {
  protected _crawlRequest?: CrawlRequest
  construction() {
    this._crawlRequest = undefined
  }
  protected abstract _run(exportOptions?: ExportOptions): CrawlResult | Promise<CrawlResult>
  public crawlAndExport(crawlRequest: CrawlRequest, exportOptions?: ExportOptions) {
    if (!crawlRequest) {
      throw new Error('ERR_NO_REQUEST_DATA')
    }
    this._crawlRequest = crawlRequest
    return this._run(exportOptions)
  }
}
```

Trong đó, kiểu `ExportOptions` có dạng như sau:

```ts
export type ExportOptions = {
  fileName?: string
  // các thuộc tính cấu hình khác - phát triển sau
}
```

> [!Important]
> Thuộc tính `Driver._crawlRequest` sẽ tự có giá trị khi gọi `crawlAndExport()`. Các lớp driver kế thừa chỉ cần định nghĩa phương thức `run()`. Phương thức `run()` sẽ chỉ cần quan tâm đến các điều kiện lọc, nơi gọi các phương thức khác.

**Ví dụ:**

```ts
export type DriverComponent = {
  configLoader: IDriverConfigurationLoader
  paginator: IDriverPaginator
  fetcher: IDriverFetcher
  crawler: IDriverCrawler
  validator?: IDriverValidator
  transformer?: IDriverTransformer
}

export class DriverBase extends Driver {
  protected readonly _components: DriverComponent
  constructor(components: DriverComponent) {
    super()
    this._components = components
  }
  protected _run(exportOptions?: ExportOptions): CrawlResult | Promise<CrawlResult> {
    // sử dụng các thành phần đề tạo thành một chức năng hoàn chỉnh
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
export interface IDriverConfigurationLoader<TJsonType> {
  load(domain: string): Promise<TJsonType>
}
```

Trong đó:

- `TJsonType` là kiểu đối tượng của toàn file cấu hình.

- Tham số `domain` sẽ lấy từ `CrawlRequest.url`.

> [!Note]
> Các lớp triển khai interface `IDriverConfigurationLoader` có thể sử dụng thêm các công cụ kiểm tra JSON (ở đây sử dụng [`zod`](https://www.npmjs.com/package/zod)).

Bảng mô tả file JSON cấu hình cho driver:

| Thuộc tính                | Kiểu dữ liêu             | Mô tả                                                                                           | Giá trị mặc định                 |
| ------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------- | -------------------------------- |
| `name`                    | `string`                 | Tên của driver. Thường là tên trang web tương ứng với tên miền. Dùng cho các mục đích hiển thị. | `''` (Chuỗi rỗng)                |
| `domain`                  | `string`                 | Tên miền của trang website mà driver được định nghĩa để cào.                                    | **Required**                     |
| `supportedExportFormat`   | `string[]`               | Định dạng mà driver hiện tại hỗ trợ                                                             | `[]`                             |
| `crawlLimit`              | `number`                 | Giới hạn cào của driver. Nếu không có điều kiện dừng nào, giá trị này sẽ được sử dụng rồi.      | `10`                             |
| `concurrencyRequestLimit` | `number`                 | Giới hạn số request được chạy đồng thời                                                         | `undefined`                      |
| `dateFormat`              | `string`       | Định dạng ngày giờ mà driver xử lý.                                                             | `'YYYY-MM-DD'` |
| `selectors`               | `Record<string, string>` | CSS Selector để tìm đến các thành phần cần cào.                                                 | `{}`                             |
| `blackList`               | `Array<BlackListItem>` | Danh sách đen. Quy định bởi các thuộc tính `rules`, `validateType` và `ignoreCase`.             | `undefined`                      |

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

export const BlackListSchema = z.record(
  CompanyDetailSchema.keyof(),
  DriverConfigRuleSchema.optional()
)

export const DriverConfigSchema = z.object({
  name: z.string().optional().default(''),
  domain: z.string(),
  dateFormat: z.string().default('YYYY-MM-DD'),
  supportedExportFormats: z.array(z.string()),
  selectors: DriverConfigSelectorSchema,
  blackList: DriverConfigBlackListSchema.optional(),
  crawlLimit: z.number().int().positive().default(10),
  concurrencyRequestLimit: z.number().int().positive().default(5)
})
```

