import { ErrorMessage } from '@/constants/error.js'
import { ExpressRequestHandler } from '@/providers/ExpressRequestHandler.js'
import { CompanyDetail } from '@/types/common.js'
import { Request } from 'express'

export const parseRequest = async (req: Request) => {
  const expressRequestHandler = new ExpressRequestHandler(req)
  const validationResult = await expressRequestHandler.validate()
  if (!validationResult.isValid) {
    throw new Error(ErrorMessage.ERR_INVALID_REQUEST)
  }
  return validationResult.transform()
}
export const select = <TKey extends keyof CompanyDetail>(...keys: TKey[]) => {
  return function (data: CompanyDetail): Pick<CompanyDetail, TKey> {
    return keys.reduce(
      (obj, key) => {
        obj[key] = data[key]
        return obj
      },
      {} as Pick<CompanyDetail, TKey>
    )
  }
}
