import type { StackProps as BaseStackProps } from 'aws-cdk-lib'
import { Stack as BaseStack } from 'aws-cdk-lib'
import type { Construct } from 'constructs'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import type { IPublicHostedZone } from 'aws-cdk-lib/aws-route53'
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53'
import type { IEventBus } from 'aws-cdk-lib/aws-events'
import { EventBus } from 'aws-cdk-lib/aws-events'

export interface RegionStackProps extends BaseStackProps {
  projectName: string
  sentryDsn?: string
  serviceName: string
  stage: string
}

export class RegionStack extends BaseStack {
  /**
   * The stage of the project, e.g., 'dev', 'staging', 'prod'.
   */
  readonly stage: string

  /**
   * The name of the project.
   */
  readonly projectName: string

  /**
   * The name of the service within the project.
   */
  readonly serviceName: string

  /**
   * The Sentry DSN for error tracking, if provided.
   */
  readonly sentryDsn?: string

  constructor(scope: Construct, id: string, props: RegionStackProps) {
    if (!props.env?.region) {
      throw new Error('Region is required in the environment configuration.')
    }

    super(scope, id, {
      ...props,
      stackName:
        props.stackName ??
        [
          ...scope.node.scopes.map((p) => p.node.id).filter((v) => !!v),
          id,
        ].join('-'),
    })

    this.stage = props.stage
    this.projectName = props.projectName
    this.serviceName = props.serviceName
    this.sentryDsn = props.sentryDsn
  }

  getDelegatedHostedZone(zoneName: string): IPublicHostedZone {
    const hostedZoneId = StringParameter.fromStringParameterName(
      this,
      'hosted-zone-id',
      `/${this.region}/${this.stage}/${this.projectName}/delegated-hosted-zone-id`
    ).stringValue

    return PublicHostedZone.fromPublicHostedZoneAttributes(
      this,
      'hosted-zone',
      {
        zoneName,
        hostedZoneId,
      }
    )
  }

  getEventBus(): IEventBus {
    const eventBusArn = StringParameter.fromStringParameterName(
      this,
      'event-bus-arn',
      `/${this.region}/${this.stage}/${this.projectName}/event-bus-arn`
    ).stringValue

    return EventBus.fromEventBusArn(this, 'event-bus', eventBusArn)
  }

  static getStack(scope: Construct): RegionStack {
    const stack = RegionStack.of(scope)

    if (!(stack instanceof RegionStack)) {
      throw Error(
        `Parent stack of ${scope.node.path} is not an instance of Stack`
      )
    }

    return stack
  }
}
