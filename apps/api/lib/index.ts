import type { RegionStackProps } from '@internal/cdk-utils/region-stack'
import { RegionStack } from '@internal/cdk-utils/region-stack'
import type { Construct } from 'constructs'
import { HonoRestApi } from '@internal/cdk-utils/hono-rest-api'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { Cors } from 'aws-cdk-lib/aws-apigateway'

interface Props extends RegionStackProps {
  databaseUrl: string
  domainName: string
}

export class ApiService extends RegionStack {
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
      handlerProps: {
        entry: './src/index.ts',
        environment: {
          DATABASE_URL: props.databaseUrl,
          EVENT_BUS_NAME: eventBus.eventBusName,
        },
      },
      hostedZone,
      restApiProps: {
        defaultCorsPreflightOptions: {
          allowCredentials: true,
          allowMethods: Cors.ALL_METHODS,
          allowHeaders: [
            'Accept',
            'Authorization',
            'Origin',
            'X-Requested-With',
            'Content-Type',
          ],
          allowOrigins: Cors.ALL_ORIGINS,
        },
      },
    })

    eventBus.grantPutEventsTo(handler)
  }
}
