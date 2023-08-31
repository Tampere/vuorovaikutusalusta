import { SurveyPage, SurveyPageSection } from '@interfaces/survey';
import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

/**
 * Reducer state type
 */
type State = {
  page: SurveyPage;
  section: SurveyPageSection;
};

/**
 * Reducer action type
 */
type Action =
  | {
      type: 'SET_SECTION';
      section: SurveyPageSection;
    }
  | {
      type: 'SET_PAGE';
      page: SurveyPage;
    };

/**
 * Type of stored context (state & reducer returned from useReducer)
 */
type Context = [State, React.Dispatch<Action>];

/**
 * Type of provider props
 */
interface Props {
  children: ReactNode;
}

/** Translation context initial values */
const stateDefaults: State = {
  page: null,
  section: null,
};

export const ClipboardContext = React.createContext<Context>(null);

/** Custom hook for accessing the workspace context */
export function useClipboard() {
  const context = useContext(ClipboardContext);

  if (!context) {
    throw new Error('useClipboard must be used within the ClipboardProvider');
  }
  const [state, dispatch] = context;

  const setSection = (section: SurveyPageSection) => {
    dispatch({ type: 'SET_SECTION', section });
  };

  const setPage = (page: SurveyPage) => {
    dispatch({ type: 'SET_PAGE', page });
  };

  return {
    setSection,
    setPage,
    section: state.section,
  };
}

/** Reducer function for dispatching actions and changing the state provided by the ClipboardContext */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SECTION':
      return {
        ...state,
        section: action.section,
      };
    case 'SET_PAGE':
      return {
        ...state,
        page: action.page,
      };
    default:
      throw new Error('Invalid action type');
  }
}

export default function ClipboardProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, stateDefaults);

  /**
   * Listen for changes in the local storage so that all browser tabs get notification of the copied survey page/section
   */
  useEffect(() => {
    // Event listener for the storage event
    const handleStorageChange = (event: any) => {
      if (event.key === 'clipboard-content') {
        // Handle the change, e.g., update your component's state
        const clipboardContent = JSON.parse(event.newValue);
        console.log('Data in localStorage updated:', clipboardContent);
        const {
          section,
          page,
        }: { section: SurveyPageSection; page: SurveyPage } = clipboardContent;
        page && dispatch({ type: 'SET_PAGE', page });
        section && dispatch({ type: 'SET_SECTION', section });
      }
    };

    // Add the event listener when the component mounts
    window.addEventListener('storage', handleStorageChange);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  /**
   * Use React.useMemo here to avoid unnecessary rerenders
   * @see https://reactjs.org/docs/hooks-reference.html#usememo
   */
  const value = useMemo<Context>(() => [state, dispatch], [state]);

  return (
    <ClipboardContext.Provider value={value}>
      {children}
    </ClipboardContext.Provider>
  );
}
