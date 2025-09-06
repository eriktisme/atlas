import type { RegionStackProps } from '@internal/cdk-utils/region-stack'
import { RegionStack } from '@internal/cdk-utils/region-stack'
import type { Construct } from 'constructs'
import type { IPublicHostedZone } from 'aws-cdk-lib/aws-route53'
import { CnameRecord } from 'aws-cdk-lib/aws-route53'
import {
  CaaRecord,
  CaaTag,
  NsRecord,
  PublicHostedZone,
} from 'aws-cdk-lib/aws-route53'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'

export interface Props extends RegionStackProps {
  domainName: string
}

export class Network extends RegionStack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)

    if (!props.env?.region) {
      throw new Error('Region is required in the environment configuration.')
    }

    const rootHostedZone = this.getRootHostedZone(props)

    let zoneName = `${props.env.region}.${props.domainName}`

    if (props.stage !== 'prod') {
      zoneName = `${props.env.region}.${props.stage}.envs.${props.domainName}`
    }

    const delegatedZone = new PublicHostedZone(this, 'delegated-hosted-zone', {
      zoneName,
      comment: `This is a the hosted zone for the project that handles the ${props.env.region} region`,
    })

    new StringParameter(this, 'delegated-hosted-zone-id', {
      parameterName: `/${props.env.region}/${props.stage}/${props.projectName}/delegated-hosted-zone-id`,
      stringValue: delegatedZone.hostedZoneId,
    })

    new NsRecord(this, 'delegate', {
      recordName: zoneName,
      zone: rootHostedZone,
      values: delegatedZone.hostedZoneNameServers ?? [],
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
      zone: delegatedZone,
    })

    new CnameRecord(this, 'cname', {
      domainName: '87fc35972fbfb4c4.vercel-dns-017.com',
      recordName: `app.${zoneName}`,
      zone: delegatedZone,
    })
  }

  protected getRootHostedZone(props: Props): IPublicHostedZone {
    if (!props.env?.region) {
      throw new Error('Region is required in the environment configuration.')
    }

    const stack =
      props.env.region === 'eu-west-1'
        ? this
        : new RegionStack(this, 'root-hosted-zone-stack', {
            ...props,
            crossRegionReferences: true,
            env: {
              region: 'eu-west-1',
            },
          })

    const hostedZoneId = StringParameter.fromStringParameterName(
      stack,
      'root-hosted-zone-id',
      `/${stack.region}/${props.stage}/${props.projectName}/root-hosted-zone-id`
    ).stringValue

    return PublicHostedZone.fromPublicHostedZoneAttributes(
      stack,
      'root-hosted-zone',
      {
        zoneName: props.domainName,
        hostedZoneId,
      }
    )
  }
}
