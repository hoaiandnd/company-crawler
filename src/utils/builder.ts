import { ErrorMessage } from '@/constants/error.js'
import { ExpressRequestHandler } from '@/providers/ExpressRequestHandler.js'
import { Request } from 'express'

export const parseRequest = async (req: Request) => {
  const expressRequestHandler = new ExpressRequestHandler(req)
  const validationResult = await expressRequestHandler.validate()
  if (!validationResult.isValid) {
    throw new Error(ErrorMessage.ERR_INVALID_REQUEST)
  }
  return validationResult.transform()
}
