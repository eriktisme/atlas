import type { RegionStackProps } from '@internal/cdk-utils/region-stack'
import { RegionStack } from '@internal/cdk-utils/region-stack'
import type { Construct } from 'constructs'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { Api } from '../constructs/api'

interface Props extends RegionStackProps {
  databaseUrl: string
  domainName: string
}

export class BackendApi extends RegionStack {
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
  }
}
