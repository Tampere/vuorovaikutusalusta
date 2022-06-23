import { Fab, Tooltip } from '@material-ui/core';
import { Check, Edit } from '@material-ui/icons';
import { useSurveyMap } from '@src/stores/SurveyMapContext';
import { useTranslations } from '@src/stores/TranslationContext';
import OskariRPC from 'oskari-rpc';
import React, { useEffect, useRef } from 'react';

interface Props {
  url: string;
  layers: number[];
  onAnswer?: () => void;
}

export default function SurveyMap(props: Props) {
  const iframeRef = useRef<HTMLIFrameElement>();
  const {
    setRpcChannel,
    isMapReady,
    initializeMap,
    modifying,
    answerGeometries,
    startModifying,
    stopModifying,
    drawing,
  } = useSurveyMap();
  const { tr } = useTranslations();

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
    const channel = OskariRPC.connect(iframeRef.current, getOrigin(props.url));
    channel.onReady(() => {
      // Set the RPC channel to context state when ready
      setRpcChannel(channel);
    });
  }, [iframeRef, props.url]);

  /**
   * Initialize map only once when it becomes ready
   */
  useEffect(() => {
    // Initialize map whenever it gets ready
    if (isMapReady) {
      initializeMap();
    }
  }, [isMapReady]);

  return (
    props.url && (
      <>
        <iframe
          ref={iframeRef}
          style={{
            border: 0,
            width: '100%',
            height: '100%',
          }}
          src={props.url}
          allow="geolocation"
          allowFullScreen
          loading="lazy"
        />
        {!drawing && !modifying && answerGeometries?.features.length > 0 && (
          <Tooltip title={tr.SurveyMap.editGeometries}>
            <Fab
              style={{ position: 'absolute', bottom: '1rem', right: '1rem' }}
              variant="extended"
              color="primary"
              aria-label="edit-geometries"
              onClick={() => {
                startModifying();
              }}
            >
              <Edit sx={{ mr: 1 }} /> {tr.commands.edit}
            </Fab>
          </Tooltip>
        )}
        {!drawing && modifying && (
          <Tooltip title={tr.SurveyMap.finishEditingGeometries}>
            <Fab
              style={{ position: 'absolute', bottom: '1rem', right: '1rem' }}
              variant="extended"
              color="primary"
              aria-label="save-geometries"
              onClick={() => {
                stopModifying();
              }}
            >
              <Check sx={{ mr: 1 }} /> {tr.commands.finish}
            </Fab>
          </Tooltip>
        )}
      </>
    )
  );
}
