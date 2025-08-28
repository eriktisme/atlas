import { Construct } from 'constructs'
import type { IEventBus, EventPattern } from 'aws-cdk-lib/aws-events'
import { Rule } from 'aws-cdk-lib/aws-events'
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets'
import type { NodeJSLambdaProps } from '../lambda'
import { NodeJSLambda } from '../lambda'
import type { QueueProps, DeadLetterQueue } from 'aws-cdk-lib/aws-sqs'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import type { SqsEventSourceProps } from 'aws-cdk-lib/aws-lambda-event-sources'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { Duration } from 'aws-cdk-lib'

interface Props {
  deadLetterQueueProps?: Omit<DeadLetterQueue, 'queue'>
  eventBus: IEventBus
  eventPattern: EventPattern
  eventSourceProps?: SqsEventSourceProps
  handlerProps: NodeJSLambdaProps
  queueProps?: QueueProps
}

export class EventConsumer extends Construct {
  readonly handler: NodeJSLambda

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id)

    const deadLetterQueue = new Queue(this, 'dead-letter-queue', {
      enforceSSL: true,
    })

    const queue = new Queue(this, 'queue', {
      ...props.queueProps,
      visibilityTimeout:
        props.queueProps?.visibilityTimeout ?? Duration.seconds(30),
      deadLetterQueue: {
        ...props.deadLetterQueueProps,
        queue: deadLetterQueue,
        maxReceiveCount: props.deadLetterQueueProps?.maxReceiveCount ?? 3,
      },
      enforceSSL: true,
    })

    new Rule(this, 'rule', {
      eventBus: props.eventBus,
      eventPattern: props.eventPattern,
      targets: [new SqsQueue(queue)],
    })

    this.handler = new NodeJSLambda(this, 'handler', props.handlerProps)

    this.handler.addEventSource(
      new SqsEventSource(queue, props.eventSourceProps)
    )
  }
}
