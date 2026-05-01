import { IRequestHandler, RequestValidateResult } from '@/types/driver.js'
import { CrawlRequestSchema } from '@/types/json-schema.js'
import { Request } from 'express'

export class ExpressRequestHandler implements IRequestHandler {
  constructor(private request: Request) {}
  validate: () => RequestValidateResult | Promise<RequestValidateResult> = () => {
    const parseResult = CrawlRequestSchema.safeParse(this.request.body)
    if (!parseResult.success) {
      return {
        isValid: false
      }
    } else {
      return {
        isValid: true,
        transform: () => parseResult.data
      }
    }
  }
}
