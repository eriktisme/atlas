import type { StackProps as BaseStackProps } from 'aws-cdk-lib'
import { Stack as BaseStack } from 'aws-cdk-lib'
import type { Construct } from 'constructs'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import type { IPublicHostedZone } from 'aws-cdk-lib/aws-route53'
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53'
import type { IEventBus } from 'aws-cdk-lib/aws-events'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { Topic } from 'aws-cdk-lib/aws-sns'
import {
  MonitoringFacade,
  SnsAlarmActionStrategy,
} from 'cdk-monitoring-constructs'
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam'

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

  /**
   * The SNS topic for alarms.
   */
  readonly alarmTopic: Topic

  /**
   * The monitoring facade for setting up alarms and monitoring.
   */
  readonly monitoring: MonitoringFacade

  constructor(scope: Construct, id: string, props: RegionStackProps) {
    if (!props.env?.region) {
      throw new Error('Region is required in the environment configuration.')
    }

    const stackName = props.stackName ??
      [
        ...scope.node.scopes.map((p) => p.node.id).filter((v) => !!v),
        id,
      ].join('-')

    super(scope, id, {
      ...props,
      stackName,
    })

    this.stage = props.stage
    this.projectName = props.projectName
    this.serviceName = props.serviceName
    this.sentryDsn = props.sentryDsn

    this.alarmTopic = new Topic(this, 'alarm-topic', {
      topicName: `${props.env.region}-${props.stage}-${props.projectName}-${props.serviceName}-alarms`,
      enforceSSL: true,
    })

    this.alarmTopic.grantPublish(new ServicePrincipal('cloudwatch.amazonaws.com'))

    this.monitoring = new MonitoringFacade(this, `${stackName}-monitoring`, {
      alarmFactoryDefaults: {
        action: new SnsAlarmActionStrategy({
          onAlarmTopic: this.alarmTopic,
        }),
        actionsEnabled: true,
        alarmNamePrefix: 'Atlas',
      },
    })
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
