import type { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import {
  NodejsFunction,
  OutputFormat,
  SourceMapMode,
} from 'aws-cdk-lib/aws-lambda-nodejs'
import type { Construct } from 'constructs'
import { Architecture, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Duration } from 'aws-cdk-lib'

export interface NodeJSLambdaProps extends NodejsFunctionProps {
  serviceName: string
}

export class NodeJSLambda extends NodejsFunction {
  constructor(scope: Construct, id: string, props: NodeJSLambdaProps) {
    super(scope, id, {
      ...props,
      memorySize: props.memorySize ?? 256,
      architecture: Architecture.ARM_64,
      awsSdkConnectionReuse: false,
      bundling: {
        externalModules: ['@aws-sdk/*'],
        minify: true,
        target: 'ESNext',
        format: OutputFormat.ESM,
        keepNames: true,
        sourceMap: true,
        sourceMapMode: SourceMapMode.DEFAULT,
        sourcesContent: false,
        banner: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
        ...props.bundling,
      },
      logRetention: RetentionDays.FIVE_DAYS,
      runtime: Runtime.NODEJS_22_X,
      timeout: props.timeout ?? Duration.seconds(15),
      tracing: Tracing.ACTIVE,
      environment: {
        ...props.environment,
        AWS_XRAY_CONTEXT_MISSING: 'IGNORE_ERROR',
        POWERTOOLS_SERVICE_NAME: props.serviceName,
      },
    })
  }
}
