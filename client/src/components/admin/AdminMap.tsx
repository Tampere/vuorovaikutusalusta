import { SurveyPage } from '@interfaces/survey';
import { Box, CircularProgress } from '@mui/material';
import { connectRpc } from '@src/oskariRpc/helpers';
import { useAdminMap } from '@src/stores/SurveyMapContext';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useRef } from 'react';

interface Props {
  url: string;
  page: SurveyPage;
  allowDrawing?: boolean;
}

export function AdminMap({ url, page, allowDrawing = false }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const {
    setRpcChannel,
    isMapReady,
    startDrawingRequest,
    drawDefaultView,
    setDefaultView,
    setVisibleLayers,
  } = useAdminMap();

  const { showToast } = useToasts();
  const { tr } = useTranslations();

  /**
   * Initialize RPC channel when iframe gets loaded
   */
  useEffect(() => {
    if (!iframeRef?.current) {
      return;
    }
    // Reset RPC channel (i.e. make map "not ready")
    setRpcChannel(null);
    const channel = connectRpc(iframeRef.current, url, () => {
      showToast({
        severity: 'error',
        message: tr.SurveyMap.errorInitializingMap,
      });
    });
    channel.onReady(() => {
      // Set the RPC channel to context state when ready
      setRpcChannel(channel);
    });
  }, [iframeRef, url]);

  useEffect(() => {
    if (isMapReady) {
      setVisibleLayers(page.sidebar.mapLayers);
      setDefaultView(page.sidebar.defaultMapView);
      drawDefaultView();
      if (allowDrawing) startDrawingRequest();
    }
  }, [isMapReady]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {!isMapReady && (
        <CircularProgress
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-20px',
            marginLeft: '-20px',
            zIndex: 1,
          }}
        />
      )}
      <iframe
        ref={iframeRef}
        style={{
          opacity: isMapReady ? 1 : 0,
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
    </Box>
  );
}
