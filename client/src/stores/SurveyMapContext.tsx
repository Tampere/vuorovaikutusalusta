import { GeoJSONWithCRS } from '@interfaces/geojson';
import { MapQuestionSelectionType } from '@interfaces/survey';
import { Channel } from 'oskari-rpc';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

interface State {
  disabled: boolean;
  visibleLayers: number[];
  allLayers: number[];
  rpcChannel: Channel;
  helperText: string;
  selectionType: MapQuestionSelectionType;
  questionId: number;
  editingMapAnswer: {
    questionId: number;
    index: number;
  };
}

type Action =
  | {
      type: 'SET_DISABLED';
      value: boolean;
    }
  | {
      type: 'SET_VISIBLE_LAYERS';
      layers: number[];
    }
  | {
      type: 'SET_ALL_LAYERS';
      layers: number[];
    }
  | {
      type: 'SET_RPC_CHANNEL';
      rpcChannel: Channel;
    }
  | {
      type: 'SET_HELPER_TEXT';
      text: string;
    }
  | {
      type: 'SET_SELECTION_TYPE';
      value: MapQuestionSelectionType;
    }
  | {
      type: 'SET_QUESTION_ID';
      value: number;
    }
  | {
      type: 'SET_EDITING_MAP_ANSWER';
      value: {
        questionId: number;
        index: number;
      };
    };

type Context = [State, React.Dispatch<Action>];

const stateDefaults: State = {
  disabled: true,
  visibleLayers: [],
  allLayers: [],
  rpcChannel: null,
  helperText: null,
  selectionType: null,
  questionId: null,
  editingMapAnswer: null,
};

/**
 * Context containing the state object and dispatch function.
 */
export const SurveyMapContext = createContext<Context>(null);

// Layer ID for answer geometries
const answerGeometryLayer = 'answers';

// Feature styles for geometry answers (drawing and displaying)
const featureStyle = {
  stroke: {
    color: 'rgba(0,0,0,0.5)',
    width: 10,
  },
};

/**
 * Generates a unique ID for question and selection type combination.
 * If selection type is not specified, it will be omitted from the ID.
 * @param questionId Question ID
 * @param selectionType Selection type
 * @returns Drawing event ID, e.g. `'map-answer:123:line'`
 */
function getDrawingEventId(
  questionId: number,
  selectionType?: MapQuestionSelectionType
) {
  return `map-answer:${questionId}${selectionType ? `:${selectionType}` : ''}`;
}

/**
 * Hook for accessing survey map context.
 * @returns State and survey map context functions
 */
export function useSurveyMap() {
  const context = useContext(SurveyMapContext);
  if (!context) {
    throw new Error('useSurveyMap must be used within the SurveyMapProvider');
  }

  const [state, dispatch] = context;

  const isMapReady = useMemo(
    () => Boolean(state.rpcChannel),
    [state.rpcChannel]
  );

  return {
    ...state,
    isMapReady,
    /**
     * Update disabled state
     * @param value Disabled state
     */
    setDisabled(value: boolean) {
      dispatch({ type: 'SET_DISABLED', value });
    },
    /**
     * Set visible layers
     * @param layers Visible layers
     */
    setVisibleLayers(layers: number[]) {
      dispatch({ type: 'SET_VISIBLE_LAYERS', layers });
    },
    /**
     * Set RPC channel for controlling the map
     * @param rpcChannel
     */
    setRpcChannel(rpcChannel: Channel) {
      dispatch({ type: 'SET_RPC_CHANNEL', rpcChannel });
    },
    /**
     * Initializes the map instance
     */
    initializeMap() {
      // Set handler for clicking features
      state.rpcChannel.handleEvent('FeatureEvent', function (event) {
        if (event.operation !== 'click') {
          return;
        }
        // TODO: tuleeko klikki-eventit läpi jos on drawing-mode päällä? eli voiko pitää muokkaus-moodia jatkuvasti kartalla (pl. uusien piirtomoodi)?
        // There should only be one feature collection
        const featureCollection: GeoJSON.FeatureCollection =
          event.features[0].geojson;
        // There should only be one feature
        const feature = featureCollection.features[0];
        // Pick answer data from feature properties
        const { questionId, index } = feature.properties;
        // Open editing dialog via context
        dispatch({
          type: 'SET_EDITING_MAP_ANSWER',
          value: { questionId, index },
        });
      });
    },
    /**
     * Enters the draw state and returns the geometry when user has finished drawing.
     */
    async draw(
      type: MapQuestionSelectionType,
      questionId: number,
      helperText: string
    ) {
      // Stop the previous drawing if the map is in a draw state
      if (state.selectionType) {
        const previousEventId = getDrawingEventId(
          state.questionId,
          state.selectionType
        );
        state.rpcChannel.postRequest('DrawTools.StopDrawingRequest', [
          previousEventId,
          true,
        ]);
      }
      const eventId = getDrawingEventId(questionId, type);
      dispatch({ type: 'SET_HELPER_TEXT', text: helperText });
      dispatch({ type: 'SET_QUESTION_ID', value: questionId });
      dispatch({ type: 'SET_SELECTION_TYPE', value: type });

      // Start the new drawing
      state.rpcChannel.postRequest('DrawTools.StartDrawingRequest', [
        eventId,
        type === 'point'
          ? 'Point'
          : type === 'line'
          ? 'LineString'
          : type === 'area'
          ? 'Polygon'
          : null,
        {
          allowMultipleDrawing: false,
          style: {
            // Due to some buggy changes in https://github.com/mozilla/jschannel/pull/15 the recursive object check fails,
            // unless we do a deep copy of the style object.
            draw: JSON.parse(JSON.stringify(featureStyle)),
            modify: JSON.parse(JSON.stringify(featureStyle)),
          },
        },
      ]);
      // Wait for the matching finished drawing event
      const geometry = await new Promise<
        GeoJSONWithCRS<
          GeoJSON.Feature<GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon>
        >
      >((resolve) => {
        state.rpcChannel.handleEvent('DrawingEvent', function (event) {
          const [, eventQuestionId, eventSelectionType] = event.id.split(':');
          // Skip unfinished events and events for a different question and different selection type (if specified)
          if (
            !event.isFinished ||
            eventQuestionId !== String(questionId) ||
            (eventSelectionType && eventSelectionType !== type)
          ) {
            return;
          }
          // Resolve the geometry from the event if there are any features
          resolve(
            event.geojson.features.length
              ? {
                  ...event.geojson.features[0],
                  crs: {
                    type: 'name',
                    properties: { name: event.geojson.crs },
                  },
                }
              : null
          );
          state.rpcChannel.unregisterEventHandler('DrawingEvent', this[0]);
        });
      });
      // If no geometry was returned, the drawing was already stopped from the outside
      // - otherwise stop the drawing with a separate request
      if (geometry) {
        state.rpcChannel.postRequest('DrawTools.StopDrawingRequest', [
          eventId,
          false,
        ]);
      }
      return geometry;
    },
    /**
     * Stops the drawing interaction on the map for given event ID
     * @param questionId Question ID (default current question ID)
     */
    stopDrawing(questionId?: number) {
      state.rpcChannel.postRequest('DrawTools.StopDrawingRequest', [
        getDrawingEventId(questionId ?? state.questionId, state.selectionType),
        true,
      ]);
    },
    /**
     * Show geometries on map. Old geometries will be cleared.
     * @param geometries Geometries
     */
    showGeometries(geometries: GeoJSON.FeatureCollection) {
      state.rpcChannel.postRequest('MapModulePlugin.AddFeaturesToMapRequest', [
        geometries,
        {
          layerId: answerGeometryLayer,
          centerTo: false,
          clearPrevious: true,
          featureStyle,
        },
      ]);
    },
    /**
     * Zoom to geometries shown on the answer geometry layer.
     */
    zoomToAnswerGeometries() {
      state.rpcChannel.postRequest('MapModulePlugin.ZoomToFeaturesRequest', [
        { layer: [answerGeometryLayer] },
        {},
      ]);
    },
    /**
     * Clears geometries from the map.
     */
    clearGeometries() {
      state.rpcChannel.postRequest(
        'MapModulePlugin.RemoveFeaturesFromMapRequest',
        [null, null, answerGeometryLayer]
      );
    },
    stopEditingMapAnswer() {
      dispatch({ type: 'SET_EDITING_MAP_ANSWER', value: null });
    },
    /**
     * Is map currently active (in drawing state)
     */
    get isMapActive() {
      return state.selectionType !== null;
    },
  };
}

/**
 * Reducer for SurveyMapContext state.
 * @param state Previous state
 * @param action Dispatched action
 * @returns New state
 */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_DISABLED':
      return {
        ...state,
        disabled: action.value,
      };
    case 'SET_VISIBLE_LAYERS':
      return {
        ...state,
        visibleLayers: action.layers,
      };
    case 'SET_ALL_LAYERS':
      return {
        ...state,
        allLayers: action.layers,
      };
    case 'SET_RPC_CHANNEL':
      return {
        ...state,
        rpcChannel: action.rpcChannel,
      };
    case 'SET_HELPER_TEXT':
      return {
        ...state,
        helperText: action.text,
      };
    case 'SET_SELECTION_TYPE':
      return {
        ...state,
        selectionType: action.value,
      };
    case 'SET_QUESTION_ID':
      return {
        ...state,
        questionId: action.value,
      };
    case 'SET_EDITING_MAP_ANSWER':
      return {
        ...state,
        editingMapAnswer: action.value,
      };
    default:
      throw new Error('Invalid action type');
  }
}

/**
 * Provider component for SurveyMapContext.
 */
export default function SurveyMapProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, stateDefaults);
  /**
   * Use React.useMemo here to avoid unnecessary rerenders
   * @see https://reactjs.org/docs/hooks-reference.html#usememo
   */
  const value = useMemo<Context>(() => [state, dispatch], [state]);

  /**
   * Initialization of the map once RPC channel is created
   */
  useEffect(() => {
    if (!state.rpcChannel) {
      return;
    }
    state.rpcChannel.getAllLayers((allLayers) => {
      const layers = allLayers.map((layer) => layer.id);
      dispatch({ type: 'SET_ALL_LAYERS', layers });
      // Set all layers to be visible by default, unless there already are visible layers declared
      dispatch({
        type: 'SET_VISIBLE_LAYERS',
        layers: state.visibleLayers ?? layers,
      });
    });
  }, [state.rpcChannel]);

  /**
   * Whenever changes are made to visible layers, update the visibility to state
   */
  useEffect(() => {
    if (!state.allLayers || !state.rpcChannel) {
      return;
    }
    state.allLayers.forEach((layerId) => {
      // Update visibility for each layer - only show it if current page has that layer visible
      state.rpcChannel.postRequest(
        'MapModulePlugin.MapLayerVisibilityRequest',
        [layerId, state.visibleLayers.includes(layerId)]
      );
    });
  }, [state.rpcChannel, state.allLayers, state.visibleLayers]);

  return (
    <SurveyMapContext.Provider value={value}>
      {children}
    </SurveyMapContext.Provider>
  );
}
