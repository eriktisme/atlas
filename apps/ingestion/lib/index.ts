import type { StackProps } from '@internal/cdk-utils/stack'
import { Stack } from '@internal/cdk-utils/stack'
import type { Construct } from 'constructs'
import { HonoRestApi } from '@internal/cdk-utils/hono-rest-api'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { PersistCapturedEventsToDatabase } from '../constructs/persist-captured-events-to-database'
import { PersistIdentifiedPeopleToDatabase } from '../constructs/persist-identified-people-to-database'
import { PersistIdentifiedGroupsToDatabase } from '../constructs/persist-identified-groups-to-database'
import { DispatchCapturedEventsToIntegrations } from '../constructs/dispatch-captured-events-to-integrations'
import { PersistCapturedEventsToStorage } from '../constructs/persist-captured-events-to-storage'

interface Props extends StackProps {
  databaseUrl: string
  domainName: string
}

export class IngestionService extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)

    const eventBusArn = StringParameter.fromStringParameterName(
      this,
      'event-bus-arn',
      `/${props.env?.region}/${props.stage}/${props.projectName}/event-bus-arn`
    ).stringValue

    const eventBus = EventBus.fromEventBusArn(this, 'event-bus', eventBusArn)

    const hostedZone = this.getDelegatedHostedZone(props.domainName)

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

    new PersistCapturedEventsToStorage(
      this,
      'persist-captured-events-to-storage',
      {
        eventBus,
      }
    )

    new PersistCapturedEventsToDatabase(
      this,
      'persist-captured-events-to-database',
      {
        eventBus,
        databaseUrl: props.databaseUrl,
      }
    )

    new PersistIdentifiedPeopleToDatabase(
      this,
      'persist-identified-people-to-database',
      {
        eventBus,
        databaseUrl: props.databaseUrl,
      }
    )

    new PersistIdentifiedGroupsToDatabase(
      this,
      'persist-identified-groups-to-database',
      {
        eventBus,
        databaseUrl: props.databaseUrl,
      }
    )

    new DispatchCapturedEventsToIntegrations(
      this,
      'dispatch-captured-events-to-integrations',
      {
        eventBus,
        databaseUrl: props.databaseUrl,
      }
    )
  }
}
