import React from 'react';
import {
  AppBar,
  List,
  ListItem,
  Theme,
  Toolbar,
  Typography,
} from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import SurveyLanguageMenu from '../SurveyLanguageMenu';
import LanguageMenu from '../LanguageMenu';
import { AdminInstructionButton } from './AdminInstructionButton';
import AppBarUserMenu from './AppBarUserMenu';
import { useTranslations } from '@src/stores/TranslationContext';
import { NavLink } from 'react-router-dom';

interface Props {
  labels?: string[];
  withHomeLink?: boolean;
  style?: SystemStyleObject<Theme>;
}

export function AdminAppBar({
  labels = [],
  withHomeLink = true,
  style = {},
}: Props) {
  const { tr } = useTranslations();

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <List
          sx={{
            ...style,
            display: 'flex',
            flexWrap: 'nowrap',
            '& li': {
              padding: '0',
            },
            'li+li::before': {
              content: '" - "',
              padding: '0px 10px',
              lineHeight: 1.6,
              fontSize: '1.25rem',
            },
          }}
        >
          {withHomeLink && (
            <ListItem>
              <Typography
                variant="subtitle1"
                noWrap
                component={NavLink}
                to="/"
                sx={{
                  textDecoration: 'none',
                  color: 'white',
                  '&:hover': {
                    opacity: 0.6,
                  },
                }}
              >
                {tr.SurveyList.title.main}
              </Typography>
            </ListItem>
          )}
          {labels.map((item, index) => (
            <ListItem
              key={`${item}-${index}`}
              sx={{ maxWidth: index === 0 ? '300px' : 'auto' }}
            >
              <Typography
                noWrap
                variant="subtitle1"
                component="p"
                sx={{ textOverflow: 'ellipsis' }}
                title={item}
              >
                {item}
              </Typography>
            </ListItem>
          ))}
        </List>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifySelf: 'flex-end',
          }}
        >
          <SurveyLanguageMenu />
          <LanguageMenu />
          <AdminInstructionButton />
          <AppBarUserMenu />
        </div>
      </Toolbar>
    </AppBar>
  );
}
