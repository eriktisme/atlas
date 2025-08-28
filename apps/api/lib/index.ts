import type { StackProps } from '@internal/cdk-utils/stack'
import { Stack } from '@internal/cdk-utils/stack'
import type { Construct } from 'constructs'
import { HonoRestApi } from '@internal/cdk-utils/hono-rest-api'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import { EventBus } from 'aws-cdk-lib/aws-events'

interface Props extends StackProps {
  databaseUrl: string
  domainName: string
}

export class ApiService extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)

    const hostedZone = this.getDelegatedHostedZone(props.domainName)

    const eventBusArn = StringParameter.fromStringParameterName(
      this,
      'event-bus-arn',
      `/${props.env?.region}/${props.stage}/${props.projectName}/event-bus-arn`
    ).stringValue

    const eventBus = EventBus.fromEventBusArn(this, 'event-bus', eventBusArn)

    const { handler } = new HonoRestApi(this, 'api', {
      domainName: props.domainName,
      env: props.env,
      handlerProps: {
        entry: './src/index.ts',
        environment: {
          DATABASE_URL: props.databaseUrl,
          EVENT_BUS_NAME: eventBus.eventBusName,
        },
        serviceName: props.serviceName,
      },
      hostedZone,
      projectName: props.projectName,
      restApiProps: {
        defaultCorsPreflightOptions: {
          allowOrigins: ['*'],
        },
      },
      serviceName: props.serviceName,
      stage: props.stage,
    })

    eventBus.grantPutEventsTo(handler)
  }
}
