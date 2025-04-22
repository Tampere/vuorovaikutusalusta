import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import logger from '@src/logger';

export const secrets: Record<string, string> = {};

export async function initSecrets() {
  const credential = new DefaultAzureCredential();
  const keyVaultUrl = process.env['KEY_VAULT_URL'];
  if (!keyVaultUrl) {
    logger.info('KEY_VAULT_URL is empty, using only environment variables.');
    return;
  }

  const client = new SecretClient(keyVaultUrl, credential);

  for await (const secretProperties of client.listPropertiesOfSecrets()) {
    const secret = await client.getSecret(secretProperties.name);
    if (secret.value) {
      secrets[secretProperties.name] = secret.value;
      process.env[secretProperties.name] = secret.value;
    }
  }
}
