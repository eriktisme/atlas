import type { StackProps as RootStackProps } from '@internal/cdk-utils/root-stack'
import { RootStack } from '@internal/cdk-utils/root-stack'
import type { Construct } from 'constructs'
import type { Network, Props as NetworkProps } from './network'
import {
  ARecord,
  CaaRecord,
  CaaTag,
  PublicHostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'

interface Props extends RootStackProps<Network, NetworkProps> {
  domainName: string
}

export class RootNetwork extends RootStack<Network, NetworkProps> {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)

    const zone = new PublicHostedZone(this, 'root-public-zone', {
      zoneName: props.domainName,
      comment: 'This is the root hosted zone for the project',
    })

    new StringParameter(this, 'root-hosted-zone-id', {
      parameterName: `/${props.env?.region}/${props.stage}/${props.projectName}/root-hosted-zone-id`,
      stringValue: zone.hostedZoneId,
    })

    new CaaRecord(this, 'caa', {
      recordName: props.domainName,
      values: [
        {
          flag: 0,
          tag: CaaTag.ISSUE,
          value: 'amazon.com',
        },
        {
          flag: 0,
          tag: CaaTag.ISSUE,
          value: 'amazontrust.com',
        },
        {
          flag: 0,
          tag: CaaTag.ISSUE,
          value: 'awstrust.com',
        },
        {
          flag: 0,
          tag: CaaTag.ISSUE,
          value: 'amazonaws.com',
        },
      ],
      zone,
    })
  }
}
