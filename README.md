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
    req.send('INVALID_REQUEST')
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
  transform: () => TransformedRequest
}
export type InvalidRequestResult = {
  isValid: false
}
export type RequestValidateResult = ValidRequestResult | InvalidRequestResult
```
