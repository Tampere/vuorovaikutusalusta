import { useOskari } from '@src/utils/useOskari';
import { Feature } from 'geojson';
import { FeatureStyle, MarkerStyle } from 'oskari-rpc';
import parseCSSColor from 'parse-css-color';
import React, { useEffect, useMemo, useRef } from 'react';
import { AnswerSelection } from './AnswersList';
import { useSurveyMap } from '@src/stores/SurveyMapContext';

interface Props {
  url: string;
  layers?: number[];
  features?: Feature[];
  onFeatureClick?: (feature: Feature) => void;
  selectedAnswer?: AnswerSelection;
}

export default function OskariMap({
  url,
  layers,
  features,
  onFeatureClick,
  selectedAnswer,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>();
  const {
    initializeMap,
    setFeatureClickHandler,
    drawFeatures,
    isMapReady,
    setVisibleLayers,
    oskariVersion,
  } = useOskari();
  const { mapFeatureColorScheme } = useSurveyMap();

  // Default feature style
  const defaultFeatureStyles = useMemo(() => {
    return [
      {
        stroke: {
          color: mapFeatureColorScheme.primaryColor,
          width: 10,
        },
        fill: {
          color: mapFeatureColorScheme.primaryFillColor,
        },
      },
      {
        stroke: {
          color: mapFeatureColorScheme.secondaryColor,
          width: 10,
        },
        fill: {
          color: mapFeatureColorScheme.secondaryFillColor,
        },
      },
    ];
  }, []);

  function getFeatureStyle(
    feature: Feature,
    isPrimaryStyle: boolean,
  ): FeatureStyle {
    const selectionType =
      feature.geometry.type === 'Polygon'
        ? 'area'
        : feature.geometry.type === 'LineString'
        ? 'line'
        : 'point';
    const question = feature.properties.question;

    // Use default style for points
    if (selectionType === 'point') {
      return isPrimaryStyle ? defaultFeatureStyles[0] : defaultFeatureStyles[1];
    }
    // Get feature style from question
    const style = question.featureStyles?.[selectionType];
    // If no style is defined, use default
    if (!style) {
      return isPrimaryStyle ? defaultFeatureStyles[0] : defaultFeatureStyles[1];
    }
    // Parse & calculate fill color with a fixed opacity from the stroke color
    const parsedStrokeColor = parseCSSColor(style.strokeColor);
    const fillColor = parsedStrokeColor
      ? `rgba(${parsedStrokeColor.values.join(',')}, 0.3)`
      : isPrimaryStyle
      ? defaultFeatureStyles[0].fill.color
      : defaultFeatureStyles[1].fill.color;
    return {
      stroke: {
        color:
          style.strokeColor || isPrimaryStyle
            ? defaultFeatureStyles[0].stroke.color
            : defaultFeatureStyles[1].stroke.color,
        width: 10,
        lineDash:
          style.strokeStyle === 'dashed'
            ? [30, 10]
            : style.strokeStyle === 'dotted'
            ? [0, 14]
            : null,
        lineCap: style.strokeStyle === 'dashed' ? 'butt' : 'round',
      },
      fill: {
        color: fillColor,
      },
    };
  }

  function getMarkerStyle(
    feature: Feature,
    isPrimaryStyle: boolean,
    withMessage: boolean = true,
  ): MarkerStyle {
    const customIcon: string =
      feature.properties.question?.featureStyles?.point?.markerIcon;

    const style = {
      shape: customIcon ?? (isPrimaryStyle ? 5 : 2),
      size: customIcon && oskariVersion >= 270 && oskariVersion < 290 ? 64 : 6,
      color: isPrimaryStyle
        ? mapFeatureColorScheme.primaryColor
        : mapFeatureColorScheme.secondaryColor,
    };
    if (withMessage) {
      return { ...style, msg: feature.properties.submissionId };
    }

    return style;
  }

  /**
   * Initialize RPC channel when iframe gets loaded
   */
  useEffect(() => {
    if (!iframeRef?.current) {
      return;
    }
    initializeMap(iframeRef.current, url);
  }, [iframeRef, url]);

  /**
   * Assign click handlers when the map has been initialized
   */
  useEffect(() => {
    if (!isMapReady) {
      return;
    }

    setFeatureClickHandler(onFeatureClick);
  }, [isMapReady]);

  /**
   * Update features and markers onto the map
   */
  useEffect(() => {
    if (!isMapReady || !features) {
      return;
    }

    drawFeatures(features, getFeatureStyle, getMarkerStyle);
  }, [features, selectedAnswer, isMapReady, oskariVersion]);

  /**
   * Update visible layers onto the map
   */
  useEffect(() => {
    if (!isMapReady || !layers) {
      return;
    }
    setVisibleLayers(layers);
  }, [layers, isMapReady]);

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
