import { ValidationResult } from '@/constants/value.js'
import { DriverContext } from '@/providers/DriverContext.js'
import { CompanyDetail } from '@/types/common.js'

// lớp định nghĩa sẵn cách thao tác với blackList
export class DriverBlackListValidator<T extends CompanyDetail> {
  isInBlackkList(context: DriverContext, data: T) {
    const blackList = context.driverConfig.blackList
    if (!blackList) return false
    const blackListKeys = Object.keys(blackList) as (keyof typeof blackList)[]
    for (let key of blackListKeys) {
      if (!blackList[key]) continue
      let { rules, ignoreCase, validateType } = blackList[key]
      let validatePropertyValue = ignoreCase ? data[key]?.toLowerCase() : data[key]
      // nếu không phải hàm của string thì không cần gọi cũng không cần kiểm tra nữa
      if (!(validateType in String) && typeof validatePropertyValue[validateType] !== 'function') {
        console.log(`[DriverBlackListValidator::validate] >>> '${validateType}' is not a function of string`)
        return false
      }
      const isInvalid = rules.some(ruleWord => {
        if (ignoreCase) ruleWord = ruleWord.toLowerCase()
        return validatePropertyValue[validateType](ruleWord)
      })
      if (isInvalid) return true
    }
    return false
  }
}
