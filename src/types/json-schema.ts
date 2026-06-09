import z from 'zod'
export const ExportFormatSchema = z.enum(['docx', 'csv', 'txt', 'xlsx'])

const createCrawlFilterRangeSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    from: valueSchema.optional(),
    to: valueSchema.optional()
  })

const CrawlFilterSchema = z.object({
  limit: z.number().int().positive().optional(),
  page: createCrawlFilterRangeSchema(z.number().int().positive()).optional(),
  date: createCrawlFilterRangeSchema(
    z.union([z.number().int().positive(), z.string()])
  ).optional()
})

export const CrawlRequestSchema = z.object({
  url: z.url(),
  exportFormat: ExportFormatSchema.optional(),
  filters: CrawlFilterSchema.optional()
})

export const CompanyDetailSchema = z.object({
  name: z.string().optional().default(''),
  founder: z.string().optional().default(''),
  taxCode: z.string().optional().default(''),
  phone: z.string().length(10),
  address: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  email: z.string().optional().default(''),
  primaryBusiness: z.string().optional().default('')
})

export const SelectorSchema = z.object({
  companyLinks: z.string(),
  companyDetail: CompanyDetailSchema
})

export const RuleSchema = z.object({
  rules: z.array(z.string()),
  validateType: z.enum(['includes', 'startsWith', 'endsWith']),
  ignoreCase: z.boolean().optional().default(false)
})

export const BlackListSchema = z.record(
  CompanyDetailSchema.keyof(),
  RuleSchema.optional()
)

export const DriverConfigSchema = z.object({
  name: z.string().optional().default(''),
  domain: z.string(),
  dateFormat: z.string().default('YYYY-MM-DD'),
  supportedExportFormats: z.array(z.string()),
  crawlLimit: z.number().int().positive().default(10),
  concurrencyRequestLimit: z.number().int().positive().default(5),
  selectors: SelectorSchema.optional(),
  blackList: BlackListSchema.optional()
})
