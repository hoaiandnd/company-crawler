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
  date: createCrawlFilterRangeSchema(z.union([z.number().int().positive(), z.string()])).optional()
})

export const CrawlRequestSchema = z.object({
  url: z.url(),
  exportFormat: ExportFormatSchema.optional(),
  filters: CrawlFilterSchema.optional()
})
const OptionalString = z.string().optional().default('')
export const CompanyDetailSchema = z.object({
  name: OptionalString,
  founder: OptionalString,
  taxCode: OptionalString,
  phone: OptionalString,
  address: OptionalString,
  startDate: OptionalString,
  email: OptionalString,
  primaryBusiness: OptionalString
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

export const BlackListSchema = z.record(CompanyDetailSchema.keyof(), RuleSchema.optional())

export const TxtExportOptionsSchema = z.object({
  propertyDelimiter: z.string().optional(),
  itemDelimiter: z.string().optional()
})

const createPartialRecordSchema = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => {
  const shape = Object.fromEntries(Object.keys(schema.shape).map(key => [key, z.string()]))
  return z.object(shape).partial().strict()
}
export const ColumnHeadersMapSchema = createPartialRecordSchema(CompanyDetailSchema)
export const XlsxExportOptionsSchema = z.object({
  sheetName: z.string().optional(),
  columnHeadersMap: ColumnHeadersMapSchema.optional()
})
export const ExporterOptionsSchema = z.object({
  txt: TxtExportOptionsSchema.optional(),
  xlsx: XlsxExportOptionsSchema.optional()
})

export const DriverConfigSchema = z.object({
  name: z.string().optional().default(''),
  domain: z.string(),
  dateFormat: z.string().default('YYYY-MM-DD'),
  supportedExportFormats: z.array(z.string()).optional(),
  crawlLimit: z.number().int().positive().default(10),
  concurrencyRequestLimit: z.number().int().positive().default(5),
  selectors: SelectorSchema.optional(),
  blackList: BlackListSchema.optional(),
  exporterOptions: ExporterOptionsSchema.optional()
})

export const HopTacKinhDoanhResponseSchema = z.object({
  content: z
    .object({
      paginate: z.string().optional()
    })
    .catchall(z.string())
})
