import React from 'react';
import fiLocale from 'date-fns/locale/fi';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { theme } from '@src/themes/admin';
import Compose from '../Compose';
import EditSurvey from './EditSurvey';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import SurveyProvider from '@src/stores/SurveyContext';
import TranslationProvider from '@src/stores/TranslationContext';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import ToastProvider from '@src/stores/ToastContext';
import AdminFrontPage from './AdminFrontPage';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import LanguageRouter from '../LanguageRouter';

export default function AdminApplication() {
  return (
    <Compose
      components={[
        [
          LocalizationProvider,
          { dateAdapter: AdapterDateFns, locale: fiLocale },
        ],
        [ThemeProvider, { theme }],
        SurveyProvider,
        TranslationProvider,
        ToastProvider,
      ]}
    >
      <CssBaseline />
      <BrowserRouter basename="/admin">
        <LanguageRouter />
        <Switch>
          <Route path="/kyselyt/:surveyId">
            <EditSurvey />
          </Route>
          <Route path="/" exact>
            <AdminFrontPage />
          </Route>
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </BrowserRouter>
    </Compose>
  );
}
