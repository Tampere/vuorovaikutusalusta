import { MapLayer } from '@interfaces/survey';
import { request } from '@src/utils/request';
import OskariRPC, { Channel } from 'oskari-rpc';

function getOrigin(url: string) {
  const anchorElement = document.createElement('a');
  anchorElement.href = url;
  return `${anchorElement.protocol}//${anchorElement.hostname}${
    anchorElement.port ? `:${anchorElement.port}` : ''
  }`;
}

async function reorderAvailableLayers(
  url: string,
  channel: Channel,
  onError: () => void,
) {
  try {
    const orderedLayers = await request<MapLayer[]>(
      `/api/map/available-layers?url=${encodeURIComponent(url)}`,
    );
    orderedLayers.forEach((layer, idx) => {
      channel.postRequest('RearrangeSelectedMapLayerRequest', [layer.id, idx]);
    });
  } catch {
    onError();
  }
}

/** Connect to Oskari RPC and run custom side-effects. */
export function connectRpc(
  iframe: HTMLIFrameElement,
  url: string,
  onError: () => void,
) {
  const channel = OskariRPC.connect(iframe, getOrigin(url));

  // We'll use getCurrentState instead of onReady to be sure Oskari really is ready: https://github.com/oskariorg/oskari-documentation/issues/58
  channel.onReady(() => {
    channel.getCurrentState(async () => {
      reorderAvailableLayers(url, channel, onError);
    });
  });

  return channel;
}
