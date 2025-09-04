import type { Construct } from 'constructs'
import type { RegionStackProps } from '@internal/cdk-utils/region-stack'
import { RegionStack } from '@internal/cdk-utils/region-stack'
import { NodeJSLambda } from '@internal/cdk-utils/lambda'
import { CustomResource, Duration } from 'aws-cdk-lib'
import { Provider } from 'aws-cdk-lib/custom-resources'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { join } from 'path'
import type { Hash } from 'crypto'
import { createHash } from 'crypto'
import { readdirSync, statSync } from 'fs'

interface Props extends RegionStackProps {
  databaseUrl: string
}

export class MigrationsService extends RegionStack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)

    const migrationDirectoryPath = join(__dirname, '../src/migrations')

    const onEventHandler = new NodeJSLambda(this, 'function', {
      serviceName: props.serviceName,
      entry: './src/index.ts',
      timeout: Duration.seconds(300),
      bundling: {
        commandHooks: {
          afterBundling: (_, outputDir: string) => {
            return [
              `pwd && mkdir -p ${outputDir}/migrations && cp ${migrationDirectoryPath}/*.sql ${outputDir}/migrations`,
              `pwd && mkdir -p ${outputDir}/migrations/meta && cp ${migrationDirectoryPath}/meta/*.json ${outputDir}/migrations/meta`,
            ]
          },
          beforeBundling: () => [],
          beforeInstall: () => [],
        },
      },
      environment: {
        DATABASE_URL: props.databaseUrl,
      },
      logRetention: RetentionDays.ONE_YEAR,
    })

    const provider = new Provider(this, 'provider', {
      onEventHandler,
    })

    new CustomResource(this, 'Database:Migrations', {
      serviceToken: provider.serviceToken,
      resourceType: 'Custom::DatabaseMigrations',
      properties: {
        migrationDirectoryHash: computeHash(migrationDirectoryPath),
      },
    })
  }
}

const computeHash = (directory: string | string[], inputHash?: Hash) => {
  const hash = inputHash ? inputHash : createHash('sha1')

  const paths = Array.isArray(directory) ? directory : [directory]

  for (const path of paths) {
    const statInfo = statSync(path)

    if (statInfo.isDirectory()) {
      const directoryEntries = readdirSync(path, { withFileTypes: true })
      const fullPaths = directoryEntries.map((e) => join(path, e.name))

      computeHash(fullPaths, hash)
    } else {
      const statInfo = statSync(path)
      const fileInfo = `${path}:${statInfo.size}:${statInfo.mtimeMs}`

      hash.update(fileInfo)
    }
  }

  // if not being called recursively, get the digest and return it as the hash result
  if (!inputHash) {
    return hash.digest().toString('base64')
  }

  return
}
