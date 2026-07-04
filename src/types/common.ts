import { CompanyDetailSchema, CrawlRequestSchema } from '@/types/json-schema.js'
import z from 'zod'

// export type ExportFormat = 'docx' | 'csv' | 'txt' | 'xlsx'
// export type CrawlRequest = {
//   url: string
//   exportFormat?: ExportFormat
//   filters?: CrawlFilter
// }
// export type CrawlFilterRange<T> = {
//   from?: T
//   to?: T
// }
// export type CrawlFilter = {
//   page?: CrawlFilterRange<number>
//   limit?: number
//   date?: CrawlFilterRange<number | string>
// }
export type CrawlRequest = z.infer<typeof CrawlRequestSchema>
export type CompanyDetail = z.infer<typeof CompanyDetailSchema>
export type MayBeAsync<T> = T | Promise<T>
export type Nullable<T> = T | null | undefined
