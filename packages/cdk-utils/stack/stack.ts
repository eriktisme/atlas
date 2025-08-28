import type { StackProps as BaseStackProps } from 'aws-cdk-lib'
import { Stack as BaseStack } from 'aws-cdk-lib'
import type { Construct } from 'constructs'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import type { IPublicHostedZone } from 'aws-cdk-lib/aws-route53'
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53'
import type { IEventBus } from 'aws-cdk-lib/aws-events'
import { EventBus } from 'aws-cdk-lib/aws-events'

export interface StackProps extends BaseStackProps {
  projectName: string
  serviceName: string
  stage: string
}

export class Stack extends BaseStack {
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

  constructor(scope: Construct, id: string, props: StackProps) {
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

  static getStack(scope: Construct): Stack {
    const stack = Stack.of(scope)

    if (!(stack instanceof Stack)) {
      throw Error(
        `Parent stack of ${scope.node.path} is not an instance of Stack`
      )
    }

    return stack
  }
}
