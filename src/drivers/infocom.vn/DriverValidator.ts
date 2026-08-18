import { DriverBlackListValidator } from '@/providers/DriverBlackListValidator.js'
import { CompanyDetail } from '@/types/common.js'
import { DriverContext, IDriverValidator } from '@/types/driver.js'

export class DriverValidator
  extends DriverBlackListValidator<CompanyDetail>
  implements IDriverValidator<CompanyDetail>
{
  validate(
    _context: DriverContext,
    data: CompanyDetail
  ): boolean | Promise<boolean> {
    if (!data) return false
    const isBlackListed = this.isInBlackkList(_context, data)
    if (isBlackListed) {
      console.log(`>>> [BLACK LIST DETECT]`, data.name)
      return false
    }
    const { phone } = data
    if (!phone) {
      console.log(`>>> [NO PHONE NUMBER] ${data.name}`)
      return false
    }
    const phoneRegex =
      /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/
    const phoneRegexTestResult = phoneRegex.test(phone)
    if (!phoneRegexTestResult) {
      console.log(`>>> [INVALID PHONE NUMBER] ${data.name}`)
    }
    return phoneRegexTestResult
  }
}
