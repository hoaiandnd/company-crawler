import { DriverCrawler } from '@/drivers/hoptackinhdoanh.com/DriverCrawler.js'
import { DriverFetcher } from '@/drivers/hoptackinhdoanh.com/DriverFetcher.js'
import { DriverPaginator } from '@/drivers/hoptackinhdoanh.com/DriverPaginator.js'
import { DriverValidator } from '@/drivers/hoptackinhdoanh.com/DriverValidator.js'
import { DriverBase } from '@/providers/DriverBase.js'
import { DriverConfigurationLoader } from '@/providers/DriverConfigurationLoader.js'
import { DriverContext } from '@/providers/DriverContext.js'
import { parseRequest } from '@/utils/builder.js'
import express, { Request, Response } from 'express'

const app = express()
const PORT = 3000

app.use(express.json())

app.post('/', async (req: Request, res: Response) => {
  try {
    const crawlRequest = await parseRequest(req)
    //  truyền vào hàm tạo của driver - sử dụng xuyên suốt
    const driverContext = await DriverContext.create(
      crawlRequest,
      new DriverConfigurationLoader()
    )

    const driver = new DriverBase(
      {
        paginator: new DriverPaginator(),
        fetcher: new DriverFetcher(),
        crawler: new DriverCrawler(),
        validator: new DriverValidator(),
        configLoader: new DriverConfigurationLoader()
      },
      driverContext
    )
    await driver._run()
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'SOMETHING_WENT_WRONG'
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
