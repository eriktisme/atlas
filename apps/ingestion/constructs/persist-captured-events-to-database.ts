import { Construct } from 'constructs'
import type { IEventBus } from 'aws-cdk-lib/aws-events'
import { EventConsumer } from '@internal/cdk-utils/event-consumer'
import { Duration } from 'aws-cdk-lib'
import { Stack } from '@internal/cdk-utils/stack'

interface Props {
  databaseUrl: string
  eventBus: IEventBus
}

export class PersistCapturedEventsToDatabase extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id)

    new EventConsumer(this, 'persist-events', {
      eventBus: props.eventBus,
      handlerProps: {
        serviceName: Stack.getStack(this).serviceName,
        entry: './src/events/persist-captured-events-to-database/index.ts',
        environment: {
          DATABASE_URL: props.databaseUrl,
        },
      },
      eventSourceProps: {
        batchSize: 25,
        maxConcurrency: 2,
        maxBatchingWindow: Duration.seconds(5),
      },
      eventPattern: {
        detailType: ['event.captured'],
        source: ['ingestion'],
      },
    })
  }
}
