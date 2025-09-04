#!/usr/bin/env node
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { ApiService } from '../lib'
import { projectName } from '@internal/cdk-utils'
import { RootStack } from '@internal/cdk-utils/root-stack'

const app = new App({
  analyticsReporting: false,
})

const stage = app.node.tryGetContext('stage') ?? 'prod'

new RootStack(app, 'api-service', {
  crossRegionReferences: true,
  env: {
    region: 'eu-west-1',
  },
  projectName,
  regions: ['eu-west-1'],
  service: {
    props: {
      alarmProps: {
        webhookUrl: process.env.SLACK_WEBHOOK_URL as string,
      },
      databaseUrl: process.env.DATABASE_URL as string,
      domainName: process.env.DOMAIN_NAME as string,
      projectName,
      serviceName: 'api',
      stage,
    },
    stack: ApiService,
  },
  stage,
})
