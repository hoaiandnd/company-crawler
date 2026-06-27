import { CompanyDetail } from '@/types/common.js'
import { DriverContext, IDriverValidator } from '@/types/driver.js'

export class DriverValidator implements IDriverValidator<CompanyDetail> {
  validate(
    _context: DriverContext,
    data: CompanyDetail
  ): boolean | Promise<boolean> {
    if (!data) return false
    const { phone } = data
    if (!phone) {
      console.log(`!!!!! Company ${data.name} has no phone number`)
      return false
    }
    const phoneRegex =
      /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/
    return phoneRegex.test(phone)
  }
}
