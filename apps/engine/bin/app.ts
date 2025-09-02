#!/usr/bin/env node
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { EngineService } from '../lib'
import { projectName } from '@internal/cdk-utils'
import { RootStack } from '@internal/cdk-utils/root-stack'

const app = new App({
  analyticsReporting: false,
})

const stage = app.node.tryGetContext('stage') ?? 'prod'

new RootStack(app, 'engine-service', {
  crossRegionReferences: true,
  env: {
    region: 'eu-west-1',
  },
  projectName,
  regions: ['eu-west-1'],
  service: {
    props: {
      databaseUrl: process.env.DATABASE_URL as string,
      domainName: process.env.DOMAIN_NAME as string,
      projectName,
      serviceName: 'engine',
      stage,
    },
    stack: EngineService,
  },
  stage,
})
