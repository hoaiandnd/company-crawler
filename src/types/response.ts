import z from 'zod'
import { HopTacKinhDoanhResponseSchema } from './json-schema.js'

export type HopTacKinhDoanhResponse = z.infer<
  typeof HopTacKinhDoanhResponseSchema
>
