import type { SSMClient } from '@aws-sdk/client-ssm'
import { GetParameterCommand } from '@aws-sdk/client-ssm'

export const readParameter = async <T>(
  client: SSMClient,
  parameterName: string,
  withDecryption = false
): Promise<T> => {
  const command = new GetParameterCommand({
    Name: parameterName,
    WithDecryption: withDecryption,
  })

  const response = await client.send(command)

  if (!response.Parameter || !response.Parameter.Value) {
    throw new Error(`Parameter ${parameterName} not found or has no value`)
  }

  try {
    return JSON.parse(response.Parameter.Value) as T
  } catch {
    return response.Parameter.Value as T
  }
}
