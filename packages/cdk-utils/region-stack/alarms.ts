import { Construct } from 'constructs'
import { Topic } from 'aws-cdk-lib/aws-sns'
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { NodeJSLambda } from '../lambda'
import { SnsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { resolve } from 'path'

interface Props {
  alarmProps: AlarmProps
  projectName: string
  region: string
  serviceName: string
  stage: string
}

export interface SlackAlarmProps {
  webhookUrl: string
}

export type AlarmProps = SlackAlarmProps

/**
 * Future improvements:
 *
 * - Add support for multiple alarm notification channels (e.g., PagerDuty).
 */
export class Alarms extends Construct {
  readonly alarmTopic: Topic

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id)

    this.alarmTopic = new Topic(this, 'alarm-topic', {
      topicName: `${props.region}-${props.stage}-${props.projectName}-${props.serviceName}-alarms`,
      enforceSSL: true,
    })

    this.alarmTopic.grantPublish(
      new ServicePrincipal('cloudwatch.amazonaws.com')
    )

    const handler = new NodeJSLambda(this, 'sns-to-slack-handler', {
      entry: resolve(__dirname, './sns-to-slack/index.ts'),
      environment: {
        WEBHOOK_URL: props.alarmProps.webhookUrl,
      },
    })

    handler.addEventSource(new SnsEventSource(this.alarmTopic))
  }
}
