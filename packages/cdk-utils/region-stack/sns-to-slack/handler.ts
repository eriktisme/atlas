import { z } from 'zod'
import type { SNSHandler } from 'aws-lambda'
import { Logger } from '@aws-lambda-powertools/logger'

const logger = new Logger()

const ConfigSchema = z.object({
  webhookUrl: z.string(),
})

const config = ConfigSchema.parse({
  webhookUrl: process.env.WEBHOOK_URL,
})

export const buildHandler: SNSHandler = async (event) => {
  for (const record of event.Records) {
    const text = record.Sns.Message

    const request = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
      }),
    })

    if (!request.ok) {
      logger.error('Failed to send message to Slack', {
        status: request.status,
        statusText: request.statusText,
      })
    }
  }
}
