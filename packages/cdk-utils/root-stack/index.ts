import type { StackProps as BaseStackProps } from 'aws-cdk-lib'
import { Stack as BaseStack } from 'aws-cdk-lib'
import type { Construct } from 'constructs'
import type {
  Stack as ServiceStack,
  StackProps as ServiceStackProps,
} from '../stack'

interface Service<
  TServiceProps extends ServiceStackProps,
  TService extends ServiceStack,
> {
  props: TServiceProps
  stack: new (scope: Construct, id: string, props: TServiceProps) => TService
}

export interface StackProps<
  TService extends ServiceStack,
  TServiceProps extends ServiceStackProps,
> extends BaseStackProps {
  projectName: string
  regions: string[]
  service: Service<TServiceProps, TService>
  stage: string
}

export class RootStack<
  TService extends ServiceStack,
  TServiceProps extends ServiceStackProps,
> extends BaseStack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps<TService, TServiceProps>
  ) {
    if (!props.env?.region) {
      throw new Error('Region is required in the environment configuration.')
    }

    super(scope, `${props.stage}-${props.projectName}-${id}`, {
      ...props,
      stackName: [
        props.stage,
        props.projectName,
        ...scope.node.scopes.map((p) => p.node.id).filter((v) => !!v),
        id,
      ].join('-'),
    })

    props.regions.forEach((region) => {
      new props.service.stack(this, region, {
        ...props.service.props,
        crossRegionReferences: true,
        env: {
          region,
        },
        tags: {
          ...props.service.props.tags,
          Project: props.projectName,
          Stage: props.stage,
          Region: region,
        },
      })
    })
  }
}
