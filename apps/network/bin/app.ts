#!/usr/bin/env node
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { Network, RootNetwork } from '../lib'
import { projectName } from '@internal/cdk-utils'

const app = new App({
  analyticsReporting: false,
})

const stage = app.node.tryGetContext('stage') ?? 'prod'

const domainName = process.env.DOMAIN_NAME as string

new RootNetwork(app, 'network', {
  crossRegionReferences: true,
  regions: ['eu-west-1'],
  service: {
    props: {
      serviceName: 'network',
      domainName,
      projectName,
      stage,
    },
    stack: Network,
  },
  projectName,
  stage,
  env: {
    region: 'eu-west-1',
  },
  domainName,
  tags: {
    Project: projectName,
    Stage: stage,
    Region: 'eu-west-1',
  },
})
