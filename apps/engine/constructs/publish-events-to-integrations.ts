import { Construct } from 'constructs'
import type { IEventBus } from 'aws-cdk-lib/aws-events'
import { EventConsumer } from '@internal/cdk-utils/event-consumer'
import { Duration } from 'aws-cdk-lib'
import { RegionStack } from '@internal/cdk-utils/region-stack'

interface Props {
  databaseUrl: string
  eventBus: IEventBus
}

export class PublishEventsToIntegrations extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id)

    const { monitoring } = RegionStack.getStack(this)

    const { deadLetterQueue, handler, queue } = new EventConsumer(
      this,
      'consumer',
      {
        eventBus: props.eventBus,
        handlerProps: {
          entry: './src/events/publish-events-to-integrations/index.ts',
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
          source: ['frontend-api'],
        },
      }
    )

    if (monitoring) {
      monitoring
        .addLargeHeader('Events to Integrations')
        .monitorLambdaFunction({
          lambdaFunction: handler,
        })
        .monitorSqsQueueWithDlq({
          queue,
          deadLetterQueue,
        })
    }
  }
}
