import { AppBar, IconButton, Toolbar, Typography } from '@material-ui/core';
import { Menu as MenuIcon } from '@material-ui/icons';
import { useSurvey } from '@src/stores/SurveyContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';
import LanguageMenu from '../LanguageMenu';
import SurveyLanguageMenu from '../SurveyLanguageMenu';
import AppBarUserMenu from './AppBarUserMenu';

interface Props {
  sideBarWidth: number;
  onDrawerToggle: () => void;
}

export default function EditSurveyHeader(props: Props) {
  // Change title only on save?
  const { originalActiveSurvey } = useSurvey();
  const { language } = useTranslations();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${props.sideBarWidth}px)` },
        ml: { md: `${props.sideBarWidth}px` },
      }}
    >
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={props.onDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" noWrap component="div">
            {originalActiveSurvey?.title?.[language] ?? ''}
          </Typography>
          <Typography variant="subtitle2" noWrap component="div">
            {originalActiveSurvey?.subtitle?.[language] ?? ''}
          </Typography>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          {originalActiveSurvey.localisationEnabled && <SurveyLanguageMenu />}
          <LanguageMenu />
          <AppBarUserMenu />
        </div>
      </Toolbar>
    </AppBar>
  );
}
