import { SurveyPage } from '@interfaces/survey';
import { CircularProgress } from '@mui/material';
import { useAdminMap } from '@src/stores/SurveyMapContext';
import OskariRPC from 'oskari-rpc';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  url: string;
  page: SurveyPage;
}

export function AdminMap({ url, page }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>();
  const {
    setRpcChannel,
    isMapReady,
    startDrawingRequest,
    drawDefaultView,
    setDefaultView,
  } = useAdminMap();
  const [readyToDraw, setReadyToDraw] = useState(false);

  /**
   * More crossbrowser-safe alternative to detecting origin from URL
   * (compared to URL.origin, with only ~80% global support at the moment of writing this)
   * @param url URL
   * @returns Origin of the URL
   */
  function getOrigin(url: string) {
    const anchorElement = document.createElement('a');
    anchorElement.href = url;
    return `${anchorElement.protocol}//${anchorElement.hostname}${
      anchorElement.port ? `:${anchorElement.port}` : ''
    }`;
  }

  /**
   * Initialize RPC channel when iframe gets loaded
   */
  useEffect(() => {
    if (!iframeRef?.current) {
      return;
    }
    // Reset RPC channel (i.e. make map "not ready")
    setRpcChannel(null);
    const channel = OskariRPC.connect(iframeRef.current, getOrigin(url));
    channel.onReady(() => {
      // Set the RPC channel to context state when ready
      setRpcChannel(channel);
    });
  }, [iframeRef, url]);

  useEffect(() => {
    if (isMapReady) {
      setDefaultView(page.sidebar.defaultMapView);
      drawDefaultView();
      startDrawingRequest();
    }
  }, [isMapReady]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        border: 0,
        width: '100%',
        height: '100%',
        margin: '0 auto',
      }}
      src={url}
      allow="geolocation"
      allowFullScreen
      loading="lazy"
    />
  );
}
