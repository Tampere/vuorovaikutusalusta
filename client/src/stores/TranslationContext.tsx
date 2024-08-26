import { LocalizedText } from '@interfaces/survey';
import React, { ReactNode, useContext, useMemo, useReducer } from 'react';
import { useHistory } from 'react-router-dom';
import en from './en.json';
import fi from './fi.json';
import se from './se.json';

// Object containing all translations
const translations = {
  fi,
  en,
  se,
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
  surveyLanguage: Language;
  languages: Language[];
};

/**
 * Reducer action type
 */
type Action = {
  type: 'SET_LANGUAGE' | 'SET_SURVEY_LANGUAGE';
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
  surveyLanguage: 'fi',
  languages: ['fi', 'en', 'se'],
};

export const TranslationContext = React.createContext<Context>(null);

/** Custom hook for accessing the workspace context */
export function useTranslations() {
  const context = useContext(TranslationContext);
  const history = useHistory();

  if (!context) {
    throw new Error(
      'useTranslations must be used within the TranslationProvider',
    );
  }
  const [state, dispatch] = context;

  const setLanguage = (language: Language) => {
    history.push(`?lang=${language ?? stateDefaults.surveyLanguage}`);
    dispatch({
      type: 'SET_LANGUAGE',
      language: language ?? stateDefaults.surveyLanguage,
    });
  };

  const setSurveyLanguage = (language: Language) => {
    dispatch({ type: 'SET_SURVEY_LANGUAGE', language });
  };

  return {
    setLanguage,
    setSurveyLanguage,
    language: state.language,
    surveyLanguage: state.surveyLanguage,
    tr: translations[state.language],
    initializeLocalizedObject: (initialValue: string | null): LocalizedText => {
      return state.languages.reduce((prevValue, currentValue) => {
        return {
          ...prevValue,
          [currentValue]: initialValue,
        };
      }, {} as LocalizedText);
    },
    languages: state.languages,
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
    case 'SET_SURVEY_LANGUAGE':
      return {
        ...state,
        surveyLanguage: action.language,
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
