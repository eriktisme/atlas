#!/usr/bin/env node
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { FrontendApi } from '../lib'
import { projectName } from '@internal/cdk-utils'
import { RootStack } from '@internal/cdk-utils/root-stack'

const app = new App({
  analyticsReporting: false,
})

const stage = app.node.tryGetContext('stage') ?? 'prod'

new RootStack(app, 'frontend-api', {
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
      serviceName: 'frontend-api',
      sentryDsn: process.env.FRONTEND_API_SENTRY_DSN as string,
      stage,
    },
    stack: FrontendApi,
  },
  stage,
})
