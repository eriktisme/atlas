import { Construct } from 'constructs'
import type { EventBus } from 'aws-cdk-lib/aws-events'
import { Rule } from 'aws-cdk-lib/aws-events'
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  BucketEncryption,
} from 'aws-cdk-lib/aws-s3'
import { Duration, RemovalPolicy } from 'aws-cdk-lib'
import { KinesisFirehoseStreamV2 } from 'aws-cdk-lib/aws-events-targets'
import {
  DeliveryStream,
  S3Bucket,
  StreamEncryption,
} from 'aws-cdk-lib/aws-kinesisfirehose'

interface PersistEventsProps {
  eventBus: EventBus
}

export class PersistEvents extends Construct {
  constructor(scope: Construct, id: string, props: PersistEventsProps) {
    super(scope, id)

    const destination = new Bucket(this, 'destination', {
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const stream = new DeliveryStream(this, 'event-delivery-stream', {
      destination: new S3Bucket(destination, {
        bufferingInterval: Duration.seconds(60),
      }),
      encryption: StreamEncryption.awsOwnedKey(),
    })

    new Rule(this, 'rule', {
      eventBus: props.eventBus,
      eventPattern: {
        source: ['ingestion'],
      },
      targets: [new KinesisFirehoseStreamV2(stream)],
    })
  }
}
