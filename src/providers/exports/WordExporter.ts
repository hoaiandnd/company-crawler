import { DriverExporterOptions, IDriverExporter } from '@/types/driver.js'

export class WordExporter implements IDriverExporter {
  canHandle(format: string): boolean {
    throw new Error('Method not implemented.')
  }
  export<T = any>(data: T[], options?: DriverExporterOptions<T>): void | Promise<void> {
    throw new Error('Method not implemented.')
  }
  close(): void | Promise<void> {
    throw new Error('Method not implemented.')
  }
}
