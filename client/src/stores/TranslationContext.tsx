import React, { ReactNode, useContext, useMemo, useReducer } from 'react';
import fi from './fi.json';

// Object containing all translations
// TODO: add other language translations here
const translations = {
  fi,
};

/**
 * All possible languages
 */
type Language = keyof typeof translations;

/**
 * Reducer state type
 */
type State = {
  language: Language;
};

/**
 * Reducer action type
 */
type Action = {
  type: 'SET_LANGUAGE';
  language: Language;
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
  language: 'fi',
};

export const TranslationContext = React.createContext<Context>(null);

/** Custom hook for accessing the workspace context */
export function useTranslations() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error(
      'useTranslations must be used within the TranslationProvider'
    );
  }
  const [state, dispatch] = context;

  const setLanguage = (language: Language) =>
    dispatch({ type: 'SET_LANGUAGE', language });

  return {
    setLanguage,
    language: state.language,
    tr: translations[state.language],
  };
}

/** Reducer function for dispatching actions and changing the state provided by the TranslationContext */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.language,
      };
    default:
      throw new Error('Invalid action type');
  }
}

export default function TranslationProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, stateDefaults);
  /**
   * Use React.useMemo here to avoid unnecessary rerenders
   * @see https://reactjs.org/docs/hooks-reference.html#usememo
   */
  const value = useMemo<Context>(() => [state, dispatch], [state]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}
