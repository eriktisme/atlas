import { Construct } from 'constructs'
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda'
import type { LambdaRestApiProps } from 'aws-cdk-lib/aws-apigateway'
import { EndpointType, LambdaRestApi } from 'aws-cdk-lib/aws-apigateway'
import type { IPublicHostedZone } from 'aws-cdk-lib/aws-route53'
import { AaaaRecord, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53'
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager'
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets'
import type { NodeJSLambdaProps } from '../lambda'
import { NodeJSLambda } from '../lambda'
import { Stack } from '../stack'
import type { ClerkProps } from '../types'

export interface HonoRestApiProps {
  clerk?: ClerkProps
  databaseUrl?: string
  domainName: string
  handlerProps: NodeJSLambdaProps
  hostedZone: IPublicHostedZone
  restApiProps?: Omit<LambdaRestApiProps, 'handler'>
}

export class HonoRestApi extends Construct {
  handler: NodeJSLambda
  api: LambdaRestApi

  constructor(scope: Construct, id: string, props: HonoRestApiProps) {
    super(scope, id)

    const { projectName, region, sentryDsn, serviceName, stage } =
      Stack.getStack(this)

    if (!region) {
      throw new Error('Region is required in the environment configuration.')
    }

    let zoneName = `${region}.${props.domainName}`

    if (stage !== 'prod') {
      zoneName = `${region}/${stage}.envs.${props.domainName}`
    }

    this.handler = new NodeJSLambda(this, 'handler', {
      ...props.handlerProps,
      environment: {
        ...props.handlerProps.environment,
        DOMAIN_NAME: zoneName,
        PROJECT_NAME: projectName,
        STAGE: stage,
      },
    })

    this.handler.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    })

    if (sentryDsn) {
      this.handler.addEnvironment('SENTRY_DSN', sentryDsn)
    }

    if (props.databaseUrl) {
      this.handler.addEnvironment('DATABASE_URL', props.databaseUrl)
    }

    if (props.clerk) {
      this.handler.addEnvironment(
        'CLERK_PUBLISHABLE_KEY',
        props.clerk.publishableKey
      )
      this.handler.addEnvironment('CLERK_SECRET_KEY', props.clerk.secretKey)
    }

    this.api = new LambdaRestApi(this, 'api', {
      ...props.restApiProps,
      deployOptions: {
        tracingEnabled: true,
      },
      endpointTypes: [EndpointType.REGIONAL],
      handler: this.handler,
      restApiName: `${region}-${stage}-${projectName}-${serviceName}-api`,
    })

    const domainName = `${serviceName}.${zoneName}`

    const certificate = new Certificate(this, 'certificate', {
      domainName,
      validation: CertificateValidation.fromDns(props.hostedZone),
    })

    this.api.addDomainName('default', {
      certificate,
      domainName,
    })

    new ARecord(this, 'api-a', {
      recordName: domainName,
      zone: props.hostedZone,
      target: RecordTarget.fromAlias(new ApiGateway(this.api)),
    })

    new AaaaRecord(this, 'api-aaaa', {
      recordName: domainName,
      zone: props.hostedZone,
      target: RecordTarget.fromAlias(new ApiGateway(this.api)),
    })
  }
}
