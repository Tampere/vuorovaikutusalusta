import { GeoJSONWithCRS } from '@interfaces/geojson';
import { MapQuestionSelectionType } from '@interfaces/survey';
import { LineString, Point, Polygon } from 'geojson';
import { Channel, DrawingEventHandler } from 'oskari-rpc';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

interface State {
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
  answerGeometries: GeoJSON.FeatureCollection;
  modifying: boolean;
}

type Action =
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
    }
  | {
      type: 'SET_ANSWER_GEOMETRIES';
      value: GeoJSON.FeatureCollection;
    }
  | {
      type: 'SET_MODIFYING';
      value: boolean;
    };

type Context = [State, React.Dispatch<Action>];

const stateDefaults: State = {
  visibleLayers: [],
  allLayers: [],
  rpcChannel: null,
  helperText: null,
  selectionType: null,
  questionId: null,
  editingMapAnswer: null,
  answerGeometries: {
    type: 'FeatureCollection',
    features: [],
  },
  modifying: false,
};

/**
 * Context containing the state object and dispatch function.
 */
export const SurveyMapContext = createContext<Context>(null);

// Layer ID for answer geometries
const answerGeometryLayer = 'answers';

// Drawing ID for modifying existing geometries
const modifyEventId = 'modify';

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

  /**
   * Draws given geometries as features onto the map
   * @param geometries
   */
  function drawAnswerGeometries(geometries: GeoJSON.FeatureCollection) {
    state.rpcChannel.postRequest('MapModulePlugin.AddFeaturesToMapRequest', [
      geometries,
      {
        layerId: answerGeometryLayer,
        centerTo: false,
        clearPrevious: true,
        cursor: 'pointer',
        featureStyle,
      },
    ]);
  }

  return {
    ...state,
    isMapReady,
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
     * Initializes the map instance:
     * - assigns a feature click handler (previous handlers should be automatically unregistered on unmount)
     * - Draws current answer geometries on the map (clears any previous)
     */
    initializeMap() {
      // Set handler for clicking features
      state.rpcChannel.handleEvent('FeatureEvent', (event) => {
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

      // Draw existing answer geometries onto the map
      drawAnswerGeometries(state.answerGeometries);
    },
    /**
     * Enters the draw state and returns the geometry when user has finished drawing.
     * @param type Selection type (shape)
     * @param questionId Question ID
     * @param helperText Helper text (shown in the mobile UI)
     * @returns Drawn geometry
     */
    async draw(
      type: MapQuestionSelectionType,
      questionId: number,
      helperText: string
    ) {
      // Stop the previous drawing if the map is in a draw state
      if (state.questionId) {
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
      let handler: DrawingEventHandler = null;
      const geometry = await new Promise<
        GeoJSONWithCRS<
          GeoJSON.Feature<GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon>
        >
      >((resolve) => {
        handler = (event) => {
          const [, eventQuestionId, eventSelectionType] = event.id.split(':');
          // Skip unfinished events and events for a different question and different selection type (if specified)
          if (
            !event.isFinished ||
            eventQuestionId !== String(questionId) ||
            (eventSelectionType && eventSelectionType !== type) ||
            !event.geojson.features.length
          ) {
            return;
          }
          // Resolve the geometry from the event
          resolve({
            ...event.geojson.features[0],
            crs: {
              type: 'name',
              properties: { name: event.geojson.crs },
            },
          });
        };
        state.rpcChannel.handleEvent('DrawingEvent', handler);
      });

      // Drawing is now completed - unregister the event handler
      state.rpcChannel.unregisterEventHandler('DrawingEvent', handler);

      // Stop the drawing interaction
      state.rpcChannel.postRequest('DrawTools.StopDrawingRequest', [
        eventId,
        false,
      ]);

      return geometry;
    },
    /**
     * Stops the drawing interaction on the map for given question ID (or the currently active question)
     * @param questionId Question ID (default: current question ID)
     */
    stopDrawing(questionId = state.questionId) {
      state.rpcChannel.postRequest('DrawTools.StopDrawingRequest', [
        getDrawingEventId(questionId, state.selectionType),
        true,
      ]);
      // If stopping the current drawing (or there was none), clear the internal state
      if (!state.questionId || questionId === state.questionId) {
        dispatch({ type: 'SET_SELECTION_TYPE', value: null });
        dispatch({ type: 'SET_HELPER_TEXT', text: null });
        dispatch({ type: 'SET_QUESTION_ID', value: null });
      }
    },
    /**
     * Starts modifying existing geometries.
     */
    startModifying() {
      dispatch({ type: 'SET_MODIFYING', value: true });
      // Remove all static features from the map
      state.rpcChannel.postRequest(
        'MapModulePlugin.RemoveFeaturesFromMapRequest',
        [null, null, answerGeometryLayer]
      );
      // Start modifying with currently stored answer geometries
      state.rpcChannel.postRequest('DrawTools.StartDrawingRequest', [
        modifyEventId,
        // This must have some valid value, but shouldnt matter a lot because we aren't drawing new shapes here
        'Box',
        {
          drawControl: false,
          modifyControl: true,
          geojson: {
            ...state.answerGeometries,
            features: state.answerGeometries.features.map((feature) => ({
              ...feature,
              // Oskari overwrites GeoJSON properties when entering drawing mode - form an ID to keep the data available in drawing event handler
              id: `answer:${feature.properties.questionId}:${feature.properties.index}`,
            })),
          },
          style: {
            // Due to some buggy changes in https://github.com/mozilla/jschannel/pull/15 the recursive object check fails,
            // unless we do a deep copy of the style object.
            draw: JSON.parse(JSON.stringify(featureStyle)),
            modify: JSON.parse(JSON.stringify(featureStyle)),
          },
        },
      ]);
    },
    /**
     * Stop modifying geometries.
     */
    stopModifying() {
      dispatch({ type: 'SET_MODIFYING', value: false });
      // Stop the drawing
      state.rpcChannel.postRequest('DrawTools.StopDrawingRequest', [
        modifyEventId,
        true,
        false,
      ]);
      // Draw stored answer geometries to map as static features
      drawAnswerGeometries(state.answerGeometries);
    },
    /**
     * Register a function listening to changes to geometries during modification.
     * @param questionId Which question's geometries to listen to?
     * @param callback Callback when geometries for given question ID have changed
     * @returns Function for unregistering the event handler
     */
    onModify(
      questionId: number,
      callback: (
        features: GeoJSON.Feature<Point | LineString | Polygon>[]
      ) => void
    ) {
      // Create a handler for any modification DrawingEvents
      const handler: DrawingEventHandler = (event) => {
        if (event.id !== modifyEventId || !event.isFinished) {
          return;
        }
        const changedFeatures = event.geojson.features
          // Destructure the question ID and index from feature ID and store them in properties
          .map((feature) => {
            const [, questionId, index] = String(feature.id)
              .split(':')
              .map(Number);
            return {
              ...feature,
              properties: {
                questionId,
                index,
              },
            };
          })
          // Filter out all features of other questions
          .filter((feature) => feature.properties.questionId === questionId)
          // Sort the features by index for assigning the changed features to correct slots
          .sort((a, b) => a.properties.index - b.properties.index);

        // Only invoke the callback if there were changed features for the given question ID
        if (changedFeatures.length) {
          callback(changedFeatures);
        }
      };
      state.rpcChannel.handleEvent('DrawingEvent', handler);

      // Return a function for unregistering the event handler after leaving the page
      return () => {
        state.rpcChannel.unregisterEventHandler('DrawingEvent', handler);
      };
    },
    /**
     * Update geometries shown on the map. If not modifying, the geometries will be redrawn.
     * The geometries will be stored in context for possible later modifications.
     * @param geometries Geometries
     */
    updateGeometries(geometries: GeoJSON.FeatureCollection) {
      dispatch({ type: 'SET_ANSWER_GEOMETRIES', value: geometries });
      // Only update geometries to state if still modifying
      if (state.modifying) {
        return;
      }
      state.rpcChannel.postRequest(
        'MapModulePlugin.RemoveFeaturesFromMapRequest',
        [null, null, answerGeometryLayer]
      );
      drawAnswerGeometries(geometries);
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
     * Stop editing a map answer in dialog
     */
    stopEditingMapAnswer() {
      dispatch({ type: 'SET_EDITING_MAP_ANSWER', value: null });
    },
    /**
     * Is map currently in drawing state
     */
    get drawing() {
      return state.questionId !== null;
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
    case 'SET_ANSWER_GEOMETRIES':
      return {
        ...state,
        answerGeometries: action.value,
      };
    case 'SET_MODIFYING':
      return {
        ...state,
        modifying: action.value,
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
