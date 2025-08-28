import { buildHandler } from './handler'
import type { SQSHandler } from 'aws-lambda'

export const handler: SQSHandler = buildHandler
