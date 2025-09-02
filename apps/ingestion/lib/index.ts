import type { StackProps } from '@internal/cdk-utils/stack'
import { Stack } from '@internal/cdk-utils/stack'
import type { Construct } from 'constructs'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { PersistCapturedEventsToDatabase } from '../constructs/persist-captured-events-to-database'
import { PersistIdentifiedPeopleToDatabase } from '../constructs/persist-identified-people-to-database'
import { PersistIdentifiedGroupsToDatabase } from '../constructs/persist-identified-groups-to-database'
import { PersistCapturedEventsToStorage } from '../constructs/persist-captured-events-to-storage'
import { Api } from '../constructs/api'

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

    new Api(this, 'api', {
      databaseUrl: props.databaseUrl,
      domainName: props.domainName,
      eventBus,
    })

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
  }
}
