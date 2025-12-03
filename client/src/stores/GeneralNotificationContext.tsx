import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { useToasts } from './ToastContext';
import { useTranslations } from './TranslationContext';
import { request } from '@src/utils/request';

/**
 * Context state type
 */
type State = {
  newNotifications: boolean;
};

/**
 * Reducer action type
 */
type Action = {
  type: 'SET_NEW_NOTIFICATIONS';
  newNotifications: boolean;
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

/** General notification context initial values */
const stateDefaults: State = {
  newNotifications: false,
};

export const GenralNotificationContext = React.createContext<Context>(null);

/** Custom hook for accessing the general notification context */
export function useGeneralNotifications() {
  const context = useContext(GenralNotificationContext);
  if (!context) {
    throw new Error(
      'useGeneralNotifications must be used within the GeneralNotificationProvider',
    );
  }
  const [state, _dispatch] = context;

  return state;
}

/** Reducer function for dispatching actions and changing the state provided by the GenralNotificationContext */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_NEW_NOTIFICATIONS':
      return {
        ...state,
        newNotifications: action.newNotifications,
      };
    default:
      throw new Error('Invalid action type');
  }
}

export default function GeneralNotificationProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, stateDefaults);
  const { showToast } = useToasts();
  const { tr } = useTranslations();

  /**
   * Use React.useMemo here to avoid unnecessary rerenders
   * @see https://reactjs.org/docs/hooks-reference.html#usememo
   */
  const value = useMemo<Context>(() => {
    return [state, dispatch];
  }, [state]);

  async function refreshRecentCount() {
    try {
      const data = await request<{ count: number }>(
        '/api/general-notifications/recent-count',
      );

      dispatch({
        type: 'SET_NEW_NOTIFICATIONS',
        newNotifications: data.count > 0,
      });
    } catch {
      showToast({
        severity: 'error',
        message: tr.AppBar.generalNotificationsError,
      });
    }
  }

  useEffect(() => {
    const interval = setInterval(
      () => {
        refreshRecentCount();
      },
      1000 * 60 * 60,
    );
    refreshRecentCount();
    return clearInterval(interval);
  }, []);

  return (
    <GenralNotificationContext.Provider value={value}>
      {children}
    </GenralNotificationContext.Provider>
  );
}
