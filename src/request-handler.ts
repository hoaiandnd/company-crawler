import { ErrorMessage } from '@/constants/error.js'
import { Request } from 'express'

export type TransformedRequest = {}

export interface IRequestHandler<TTransformedRequest = any> {
  validate(): { transform: () => TTransformedRequest }
}

export class RequestHandler implements IRequestHandler {
  constructor(private _request: Request) {}
  validate() {
    let result = true
    // validate logic
    if (result)
      return {
        transform: () => {
          // transform logic
          return {
            // transformed request
          }
        }
      }
    throw new Error(ErrorMessage.INVALID_REQUEST)
  }
}
