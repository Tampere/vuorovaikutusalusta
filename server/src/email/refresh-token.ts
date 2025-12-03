import { debuglog } from 'util';

export interface RefreshConfig {
  accessUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  initialRefreshToken: string;
  updateIntervalMs: number;
  loadToken: () => Promise<string>;
  persistToken: (token: string) => Promise<void>;
}

let cachedToken = null as string | null;
let cachedConfig: RefreshConfig | null = null;

const log = debuglog('refresh-token');

function maskToken(token: string | null) {
  return !token ? '-' : `${token.slice(0, 6)}...${token.slice(-4)}`;
}

async function generateNewRefreshToken(
  refreshToken: string | null,
  config: RefreshConfig,
) {
  if (!refreshToken) {
    return null;
  }
  const response = await fetch(config.accessUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      scope: config.scope,
      refresh_token: refreshToken,
    }),
  });
  if (!response.ok) {
    log(
      `Failed to generate new refresh token with: ${maskToken(refreshToken)}`,
    );
    return null;
  }

  const { refresh_token } = (await response.json()) as {
    refresh_token?: string;
  };
  if (!refresh_token) {
    log(
      `Failed to parse new refresh token, current token: ${maskToken(
        refreshToken,
      )}`,
    );
    return null;
  }

  log(`Successfully generated new refresh token: ${maskToken(refresh_token)}`);

  return refresh_token;
}

async function updateRefreshToken(config: RefreshConfig) {
  // Try to use tokens in a specific order
  const newRefreshToken =
    (await generateNewRefreshToken(cachedToken, config)) ??
    (await generateNewRefreshToken(await config.loadToken(), config)) ??
    (await generateNewRefreshToken(config.initialRefreshToken, config));

  if (!newRefreshToken) {
    throw new Error(
      'Failed to generate a new refresh token: all tokens are invalid',
    );
  }

  log(`Generated new refresh token: ${maskToken(newRefreshToken)}`);

  // Persist the new refresh token in the database and in-memory cache
  await config.persistToken(newRefreshToken);
  cachedToken = newRefreshToken;
}

/**
 * Start auto-updating the refresh token.
 * @param config Updater configuration
 */
export function startUpdatingRefreshToken(config: RefreshConfig) {
  cachedConfig = { ...config };
  updateRefreshToken(config);
  setInterval(async () => {
    try {
      await updateRefreshToken(config);
    } catch (error) {
      log(`Error updating refresh token: ${error.message}`);
    }
  }, config.updateIntervalMs);
}

/**
 * Get the current refresh token.
 * @returns Current refresh token
 */
export async function getRefreshToken() {
  if (cachedToken) {
    return cachedToken;
  }

  // Load the initial refresh token from the database
  cachedToken = await cachedConfig.loadToken();
  if (!cachedToken) {
    throw new Error('No valid refresh token found');
  }

  return cachedToken;
}
