import {
  AnswerEntry,
  Survey,
  SurveyPage,
  SurveyPageSection,
  SurveyQuestion,
} from '@interfaces/survey';
import { request } from '@src/utils/request';
import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useReducer,
} from 'react';

interface State {
  answers: AnswerEntry[];
  survey: Survey;
  unfinishedToken: string;
}

type Action =
  | {
      type: 'SET_SURVEY';
      survey: Survey;
    }
  | {
      type: 'UPDATE_ANSWER';
      answer: AnswerEntry;
    }
  | {
      type: 'UPDATE_ANSWERS';
      answers: AnswerEntry[];
    }
  | {
      type: 'SET_ANSWERS';
      answers: AnswerEntry[];
    }
  | {
      type: 'SET_UNFINISHED_TOKEN';
      token: string;
    };

type Context = [State, React.Dispatch<Action>];

const stateDefaults: State = {
  answers: [],
  survey: null,
  unfinishedToken: null,
};

// Section types that won't have an answer (e.g. text sections)
const nonQuestionSectionTypes: SurveyPageSection['type'][] = [
  'text',
  'image',
  'document',
];

/**
 * Context containing the state object and dispatch function.
 */
export const SurveyAnswerContext = createContext<Context>(null);

export function getEmptyAnswer(section: SurveyPageSection): AnswerEntry {
  switch (section.type) {
    case 'checkbox':
      return {
        sectionId: section.id,
        type: section.type,
        value: [],
      };
    case 'radio':
      return {
        sectionId: section.id,
        type: section.type,
        value: null,
      };
    case 'free-text':
      return {
        sectionId: section.id,
        type: section.type,
        value: '',
      };
    case 'numeric':
      return {
        sectionId: section.id,
        type: section.type,
        value: null,
      };
    case 'map':
      return {
        sectionId: section.id,
        type: section.type,
        value: [],
      };
    case 'sorting':
      return {
        sectionId: section.id,
        type: section.type,
        value: null,
      };
    case 'slider':
      return {
        sectionId: section.id,
        type: section.type,
        value: null,
      };
    case 'matrix':
      return {
        sectionId: section.id,
        type: section.type,
        value: new Array(section.subjects?.length ?? 1).fill(null),
      };
    case 'grouped-checkbox':
      return {
        sectionId: section.id,
        type: section.type,
        value: [],
      };
    case 'attachment':
      return {
        sectionId: section.id,
        type: section.type,
        value: [],
      };
    default:
      throw new Error(
        `No default value defined for questions of type "${section.type}"`
      );
  }
}

/**
 * Hook for accessing survey answer context.
 * @returns State and survey answer context functions
 */
export function useSurveyAnswers() {
  const context = useContext(SurveyAnswerContext);
  if (!context) {
    throw new Error('useSurvey must be used within the SurveyProvider');
  }

  const [state, dispatch] = context;

  function getValidationErrors(
    question: SurveyQuestion,
    answers = state.answers
  ) {
    const errors: ('answerLimits' | 'required' | 'minValue' | 'maxValue')[] =
      [];
    // Find the answer that corresponds to the question
    const answer = answers.find((answer) => answer.sectionId === question.id);

    // Checkbox question validation - check possible answer limits
    if (question.type === 'checkbox' || question.type === 'grouped-checkbox') {
      const value = answer.value as (number | string)[];
      // Pick only non-empty selections (numbers and non-empty strings) for the check
      const nonEmptySelections = value.filter(
        (selection) =>
          selection != null &&
          (typeof selection !== 'string' || selection.length > 0)
      );
      if (
        // If either limit is defined and that limit is broken, the answer is invalid
        (question.answerLimits?.max &&
          nonEmptySelections.length > question.answerLimits.max) ||
        (question.answerLimits?.min &&
          nonEmptySelections.length < question.answerLimits.min)
      ) {
        errors.push('answerLimits');
      }
    }

    // Numeric question validation - check min & max values
    if (question.type === 'numeric' && answer.value != null) {
      if (question.minValue != null && answer.value < question.minValue) {
        errors.push('minValue');
      }
      if (question.maxValue != null && answer.value > question.maxValue) {
        errors.push('maxValue');
      }
    }

    if (question.isRequired) {
      // Matrix is considered incomplete, if the answer array doesn't contain as many answers (exluding nulls) as there are rows in the matrix
      if (question.type === 'matrix') {
        if (
          (answer.value as string[]).filter((answer) => answer).length !==
          question.subjects?.length
        ) {
          errors.push('required');
        }
      }
      // Sorting is considered incomplete, if the array contains any nullish values
      if (question.type === 'sorting') {
        if (
          !answer.value ||
          (answer.value as number[]).some((value) => value == null)
        ) {
          errors.push('required');
        }
      }
      // If value is an array, check the array length - otherwise check for its emptiness
      else if (
        Array.isArray(answer.value)
          ? !answer.value.length
          : answer.value == null || !answer.value.toString().length
      ) {
        errors.push('required');
      }
    }
    return errors;
  }

  return {
    ...state,
    /**
     * Update survey answer
     * @param answer Survey answer
     */
    updateAnswer(answer: AnswerEntry) {
      dispatch({ type: 'UPDATE_ANSWER', answer });
    },
    /**
     * Initializes empty answers for given survey
     * @param survey
     */
    setSurvey(survey: Survey) {
      dispatch({ type: 'SET_SURVEY', survey });
      // Get all sections across survey pages
      const sections = survey.pages
        .reduce((sections, page) => [...sections, ...page.sections], [])
        // Skip sections that shouldn't get answers
        .filter((section) => !nonQuestionSectionTypes.includes(section.type));
      dispatch({
        type: 'SET_ANSWERS',
        answers: sections.map(getEmptyAnswer).filter(Boolean),
      });
    },
    /**
     * Gets possible validation errors for given question.
     * @param section Question section
     * @param answers Answers to validate against (uses answers from context state by default)
     * @returns
     */
    getValidationErrors(question: SurveyQuestion, answers = state.answers) {
      return getValidationErrors(question, answers);
    },
    /**
     * Is the entire page valid?
     * @param page Page
     * @returns Is the page valid
     */
    isPageValid(page: SurveyPage) {
      return !page.sections
        // Skip sections that shouldn't get answers
        .filter(
          (section): section is SurveyQuestion =>
            !nonQuestionSectionTypes.includes(section.type)
        )
        .some((section) => getValidationErrors(section).length);
    },
    /**
     * Fetch unfinished answer entries by token and set them into the context
     * @param token Unfinished token
     */
    async loadUnfinishedEntries(token: string) {
      dispatch({ type: 'SET_UNFINISHED_TOKEN', token });
      const answers = await request<AnswerEntry[]>(
        `/api/published-surveys/${state.survey.name}/unfinished-submission?token=${token}`
      );
      dispatch({
        type: 'UPDATE_ANSWERS',
        answers,
      });
    },
    /**
     * Sets the unfinished token into the context. The next save/submit will replace the unfinished submission.
     * @param token Unfinished token
     */
    setUnfinishedToken(token: string) {
      dispatch({ type: 'SET_UNFINISHED_TOKEN', token });
    },
  };
}

/**
 * Reducer for SurveyAnswerContext state.
 * @param state Previous state
 * @param action Dispatched action
 * @returns New state
 */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SURVEY':
      return {
        ...state,
        survey: action.survey,
      };
    case 'UPDATE_ANSWER':
      return {
        ...state,
        answers: state.answers.map((answer) =>
          answer.sectionId === action.answer.sectionId ? action.answer : answer
        ),
      };
    case 'UPDATE_ANSWERS':
      return {
        ...state,
        answers: state.answers.map(
          (answer) =>
            action.answers.find((a) => a.sectionId === answer.sectionId) ??
            answer
        ),
      };
    case 'SET_ANSWERS':
      return {
        ...state,
        answers: [...action.answers],
      };
    case 'SET_UNFINISHED_TOKEN':
      return {
        ...state,
        unfinishedToken: action.token,
      };
    default:
      throw new Error('Invalid action type');
  }
}

/**
 * Provider component for SurveyAnswerContext.
 */
export default function SurveyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, stateDefaults);
  /**
   * Use React.useMemo here to avoid unnecessary rerenders
   * @see https://reactjs.org/docs/hooks-reference.html#usememo
   */
  const value = useMemo<Context>(() => [state, dispatch], [state]);

  return (
    <SurveyAnswerContext.Provider value={value}>
      {children}
    </SurveyAnswerContext.Provider>
  );
}
