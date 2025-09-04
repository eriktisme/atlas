import { z } from 'zod'
import type { SQSEvent } from 'aws-lambda'
import { EventCapturedEvent } from '@internal/events-schema/events'
import type { PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { ulid } from 'ulid'

const ConfigSchema = z.object({
  destinationBucket: z.string(),
})

const config = ConfigSchema.parse({
  destinationBucket: process.env.DESTINATION_BUCKET,
})

interface Deps {
  s3Client: S3Client
}

export const buildHandler = async (event: SQSEvent, deps: Deps) => {
  const objects: PutObjectCommandInput[] = event.Records.map((record) => {
    const { data, metadata } = EventCapturedEvent.fromEventBridgeEvent(
      JSON.parse(record.body)
    )

    /**
     * Switch to using the timestamp from the event metadata
     */
    const receivedAt = new Date()
    const [year, month, day] = receivedAt.toISOString().split('T')[0].split('-')

    const key = `${metadata.tenantId}/${year}/${month}/${day}/event-${ulid()}.json`

    return {
      Bucket: config.destinationBucket,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: 'application/json',
    }
  })

  await Promise.allSettled(
    objects.map((input) => deps.s3Client.send(new PutObjectCommand(input)))
  )
}
