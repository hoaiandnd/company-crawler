import express, { Request, Response } from 'express'

const app = express()
const PORT = 3000

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  // const requestExtractor = new RequestHandler(req).validate().transform()
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
