import type { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

export const readSecret = async <T>(
  client: SecretsManagerClient,
  secretName: string
): Promise<T> => {
  const command = new GetSecretValueCommand({
    SecretId: secretName,
  })

  const response = await client.send(command)

  if (!response.SecretString) {
    throw new Error(`Secret ${secretName} not found or has no value`)
  }

  try {
    return JSON.parse(response.SecretString) as T
  } catch {
    return response.SecretString as T
  }
}
