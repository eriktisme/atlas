import type { StackProps as RootStackProps } from '@internal/cdk-utils/root-stack'
import { RootStack } from '@internal/cdk-utils/root-stack'
import type { Construct } from 'constructs'
import type { Network, Props as NetworkProps } from './network'
import {
  ARecord,
  CaaRecord,
  CaaTag,
  NsRecord,
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

    let zoneName = props.domainName

    if (props.stage !== 'prod') {
      zoneName = `${props.stage}.envs.${props.domainName}`
    }

    const zone = new PublicHostedZone(this, 'root-public-zone', {
      zoneName,
      comment: 'This is the root hosted zone for the project',
    })

    if (props.stage !== 'prod') {
      /**
       * Future improvements:
       *
       * - Add the ability to have the root hosted zone created outside the current account
       */
      const rootHostedZone = PublicHostedZone.fromLookup(
        this,
        'zone-to-delegate-preview-env',
        {
          domainName: props.domainName,
        }
      )

      new NsRecord(this, 'delegate', {
        recordName: zoneName,
        zone: rootHostedZone,
        values: zone.hostedZoneNameServers ?? [],
      })
    }

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

    if (props.stage === 'prod') {
      new ARecord(this, 'a', {
        target: RecordTarget.fromIpAddresses('76.76.21.21'),
        recordName: props.domainName,
        zone,
      })
    }
  }
}
