import { AnswerEntry } from '@interfaces/survey';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import { useSurveyMap } from '@src/stores/SurveyMapContext';
import { useCurrent } from '@src/utils/useCurrent';
import OskariRPC from 'oskari-rpc';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  url: string;
  layers: number[];
  onAnswer?: () => void;
}

export default function SurveyMap(props: Props) {
  const [mapInitialized, setMapInitialized] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>();
  const { disabled, setRpcChannel, isMapReady, initializeMap, onDeleteAnswer } =
    useSurveyMap();
  const { updateAnswer, answers } = useSurveyAnswers();
  // Inside the answer delete callback we must fetch current answers via ref
  const getCurrentAnswers = useCurrent(answers);

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
    const channel = OskariRPC.connect(iframeRef.current, getOrigin(props.url));
    channel.onReady(() => {
      // Set channel to context when ready
      setRpcChannel(channel);
    });
  }, [iframeRef, props.url]);

  /**
   * Initialize map only once when it becomes ready
   */
  useEffect(() => {
    if (isMapReady && !mapInitialized) {
      initializeMap();
      setMapInitialized(true);
      onDeleteAnswer((questionId, answerIndex) => {
        // Get existing answer object
        const answer = getCurrentAnswers().find(
          (answer) => answer.sectionId === questionId
        ) as AnswerEntry & { type: 'map' };
        // Update it with a filtered value array
        updateAnswer({
          ...answer,
          value: answer.value.filter((_, index) => index !== answerIndex),
        });
      });
    }
  }, [isMapReady]);

  return (
    props.url && (
      <iframe
        ref={iframeRef}
        style={{
          border: 0,
          width: '100%',
          height: '100%',
          transition: 'filter .2s ease-in-out',
          ...(disabled && {
            pointerEvents: 'none',
            filter: 'grayscale(100%) contrast(70%)',
          }),
        }}
        src={props.url}
        allow="geolocation"
        allowFullScreen
        loading="lazy"
      />
    )
  );
}
