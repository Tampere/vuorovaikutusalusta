import React from 'react';
import { fi } from 'date-fns/locale';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '@src/themes/admin';
import Compose from '../Compose';
import EditSurvey from './EditSurvey';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import SurveyProvider from '@src/stores/SurveyContext';
import TranslationProvider from '@src/stores/TranslationContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SurveyAnswerProvider from '@src/stores/SurveyAnswerContext';
import ToastProvider from '@src/stores/ToastContext';
import AdminFrontPage from './AdminFrontPage';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import LanguageRouter from '../LanguageRouter';
import ClipboardProvider from '@src/stores/ClipboardContext';
import SurveySubmissionsPage from './SubmissionsPage/SurveySubmissionsPage';
import SurveyMapProvider from '@src/stores/SurveyMapContext';
import { GeneralNotifications } from './GeneralNotification/GeneralNotificationsView';
import UserProvider from '@src/stores/UserContext';
import GeneralNotificationProvider from '@src/stores/GeneralNotificationContext';

export default function AdminApplication() {
  return (
    <Compose
      components={[
        [
          LocalizationProvider,
          { dateAdapter: AdapterDateFns, adapterLocale: fi },
        ],
        [ThemeProvider, { theme }],
        SurveyProvider,
        TranslationProvider,
        ToastProvider,
        ClipboardProvider,
        SurveyAnswerProvider,
        SurveyMapProvider,
        UserProvider,
        GeneralNotificationProvider,
      ]}
    >
      <CssBaseline />
      <BrowserRouter basename="/admin">
        <LanguageRouter />
        <Switch>
          <Route path="/kyselyt/:surveyId">
            <EditSurvey />
          </Route>
          <Route path="/vastaukset/:surveyId">
            <SurveySubmissionsPage />
          </Route>
          <Route path="/tiedotteet">
            <GeneralNotifications />
          </Route>
          <Route path="/" exact>
            <AdminFrontPage />
          </Route>
          <Route path="*" render={() => <Redirect to="/" />} />
        </Switch>
      </BrowserRouter>
    </Compose>
  );
}
