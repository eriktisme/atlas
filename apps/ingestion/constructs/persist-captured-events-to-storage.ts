import { Construct } from 'constructs'
import type { IEventBus } from 'aws-cdk-lib/aws-events'
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  BucketEncryption,
} from 'aws-cdk-lib/aws-s3'
import { Duration, RemovalPolicy } from 'aws-cdk-lib'
import { EventConsumer } from '@internal/cdk-utils/event-consumer'
import { RegionStack } from '@internal/cdk-utils/region-stack'

interface Props {
  eventBus: IEventBus
}

export class PersistCapturedEventsToStorage extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id)

    const destination = new Bucket(this, 'destination', {
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const { handler } = new EventConsumer(this, 'persist-events', {
      eventBus: props.eventBus,
      handlerProps: {
        serviceName: RegionStack.getStack(this).serviceName,
        entry: './src/events/persist-captured-events-to-storage/index.ts',
        environment: {
          DESTINATION_BUCKET: destination.bucketName,
        },
      },
      eventSourceProps: {
        batchSize: 10,
        maxConcurrency: 2,
        maxBatchingWindow: Duration.seconds(5),
      },
      eventPattern: {
        detailType: ['event.captured'],
        source: ['ingestion'],
      },
    })

    destination.grantWrite(handler)
  }
}
