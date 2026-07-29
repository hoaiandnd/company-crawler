import * as hopTacKinhDoanh from '@/drivers/hoptackinhdoanh.com/index.js'
import { DriverBase } from '@/providers/DriverBase.js'
import { DriverConfigurationLoader } from '@/providers/DriverConfigurationLoader.js'
import { DriverContext } from '@/providers/DriverContext.js'
import { parseRequest, select } from '@/utils/builder.js'
import express, { Request, Response } from 'express'
import { TextExporter } from './providers/exports/TextExporter.js'
import { ExcelExporter } from './providers/exports/ExcelExporter.js'

const app = express()
const PORT = 3000

app.use(express.json())

app.post('/', async (req: Request, res: Response) => {
  try {
    const crawlRequest = await parseRequest(req)
    const configurationLoader = new DriverConfigurationLoader()
    //  truyền vào hàm tạo của driver - sử dụng xuyên suốt
    const driverContext = await DriverContext.create(crawlRequest, configurationLoader)

    const driver = new DriverBase(
      {
        paginator: new hopTacKinhDoanh.DriverPaginator(),
        fetcher: new hopTacKinhDoanh.DriverFetcher(),
        crawler: new hopTacKinhDoanh.DriverCrawler(),
        validator: new hopTacKinhDoanh.DriverValidator(),
        exporters: [new TextExporter(), new ExcelExporter()]
      },
      driverContext
    )
    const { isFinish, lastPage } = await driver._run({
      transformFn: select('name', 'phone', 'address', 'startDate')
    })
    console.log(isFinish ? 'CRAWL FINISH' : `LAST PAGE: ${lastPage}`)
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
