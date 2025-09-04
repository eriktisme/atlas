import { Construct } from 'constructs'
import { HonoRestApi } from '@internal/cdk-utils/hono-rest-api'
import { Cors } from 'aws-cdk-lib/aws-apigateway'
import { RegionStack } from '@internal/cdk-utils/region-stack'
import type { IEventBus } from 'aws-cdk-lib/aws-events'
import { Duration } from 'aws-cdk-lib'

interface Props {
  databaseUrl: string
  domainName: string
  eventBus: IEventBus
}

export class Api extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id)

    const stack = RegionStack.getStack(this)

    const hostedZone = stack.getDelegatedHostedZone(props.domainName)

    const { api, handler } = new HonoRestApi(this, 'api', {
      domainName: props.domainName,
      handlerProps: {
        entry: './src/index.ts',
        environment: {
          DATABASE_URL: props.databaseUrl,
          EVENT_BUS_NAME: props.eventBus.eventBusName,
        },
      },
      hostedZone,
      restApiProps: {
        defaultCorsPreflightOptions: {
          allowCredentials: true,
          allowHeaders: [
            'Accept',
            'Authorization',
            'Origin',
            'X-Requested-With',
            'Content-Type',
          ],
          allowMethods: Cors.ALL_METHODS,
          allowOrigins: Cors.ALL_ORIGINS,
        },
      },
    })

    props.eventBus.grantPutEventsTo(handler)

    if (stack.monitoring) {
      stack.monitoring
        .addLargeHeader('Atlas API')
        .monitorApiGateway({
          api,
          addLatencyP95Alarm: {
            Warning: {
              maxLatency: Duration.seconds(10),
              datapointsToAlarm: 1,
            },
          },
          add5XXFaultCountAlarm: {
            Warning: {
              maxErrorCount: 5,
              datapointsToAlarm: 1,
            },
          },
          add4XXErrorCountAlarm: {
            Warning: {
              maxErrorCount: 5,
              datapointsToAlarm: 1,
            },
          },
        })
        .monitorLambdaFunction({
          lambdaFunction: handler,
        })
    }
  }
}
