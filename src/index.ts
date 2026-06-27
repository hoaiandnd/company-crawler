import {
  DriverCrawler,
  DriverFetcher,
  DriverPaginator,
  DriverValidator
} from '@/drivers/hoptackinhdoanh.com/index.js'
import { DriverBase } from '@/providers/DriverBase.js'
import { DriverConfigurationLoader } from '@/providers/DriverConfigurationLoader.js'
import { DriverContext } from '@/providers/DriverContext.js'
import { parseRequest, select } from '@/utils/builder.js'
import express, { Request, Response } from 'express'
import { TextExporter } from './providers/exports/TextExporter.js'

const app = express()
const PORT = 3000

app.use(express.json())

app.post('/', async (req: Request, res: Response) => {
  try {
    const crawlRequest = await parseRequest(req)
    const configurationLoader = new DriverConfigurationLoader()
    //  truyền vào hàm tạo của driver - sử dụng xuyên suốt
    const driverContext = await DriverContext.create(
      crawlRequest,
      configurationLoader
    )

    const driver = new DriverBase(
      {
        paginator: new DriverPaginator(),
        fetcher: new DriverFetcher(),
        crawler: new DriverCrawler(),
        validator: new DriverValidator(),
        exporters: [new TextExporter()]
      },
      driverContext
    )
    await driver._run({
      fileName: 'test-sai-gon',
      transformFn: select('name', 'phone', 'address')
    })
    console.log('CRAWL FINISH')
    res.status(200).json({ message: 'CRAWL_SUCCESS' })
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'SOMETHING_WENT_WRONG'
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
