import { AppBar, IconButton, Toolbar, Typography } from '@material-ui/core';
import { Menu as MenuIcon } from '@material-ui/icons';
import { useSurvey } from '@src/stores/SurveyContext';
import React from 'react';
import AppBarUserMenu from './AppBarUserMenu';

interface Props {
  sideBarWidth: number;
  onDrawerToggle: () => void;
}

export default function EditSurveyHeader(props: Props) {
  // Change title only on save?
  const { originalActiveSurvey } = useSurvey();
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${props.sideBarWidth}px)` },
        ml: { md: `${props.sideBarWidth}px` },
      }}
    >
      <Toolbar>
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
            {originalActiveSurvey.title}
          </Typography>
          <Typography variant="subtitle2" noWrap component="div">
            {originalActiveSurvey.subtitle}
          </Typography>
        </div>
        <AppBarUserMenu />
      </Toolbar>
    </AppBar>
  );
}
