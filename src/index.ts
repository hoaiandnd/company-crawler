import { DriverConfigurationLoader } from '@/providers/DriverConfigurationLoader.js'
import { DriverContext } from '@/providers/DriverContext.js'
import { parseRequest } from '@/utils/builder.js'
import express, { Request, Response } from 'express'

const app = express()
const PORT = 3000

app.use(express.json())

app.get('/', async (req: Request, res: Response) => {
  try {
    const crawlRequest = await parseRequest(req)
    const driverContext = await DriverContext.create(crawlRequest, new DriverConfigurationLoader())
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'SOMETHING_WENT_WRONG' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
