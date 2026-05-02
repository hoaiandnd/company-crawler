import { DriverContext, IDriverPaginator, PaginationResult } from "@/types/driver.js";

export class DriverPaginator implements IDriverPaginator {
  paginate(context: DriverContext): PaginationResult | Promise<PaginationResult> {
    const { crawlRequest } = context
    const url = crawlRequest.url
    if (!url) {
      throw new Error("ERR_NO_URL")
    }
    
    throw new Error("Method not implemented.");
  }
}