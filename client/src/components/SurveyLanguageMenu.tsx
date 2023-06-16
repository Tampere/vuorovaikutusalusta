import React, { useState } from 'react';
import { Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import { LanguageCode } from '@interfaces/survey';
import { makeStyles } from '@mui/styles';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface Props {
  style?: React.CSSProperties;
  changeUILanguage?: boolean;
}

const useStyles = makeStyles({
  root: {
    cursor: 'pointer',
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
});

export default function SurveyLanguageMenu({
  style,
  changeUILanguage = false,
}: Props) {
  const { tr, setSurveyLanguage, setLanguage, languages, surveyLanguage } =
    useTranslations();
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles();
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={classes.root} style={style}>
      <Tooltip title={tr.SurveyLanguageMenu.changeSurveyLanguage}>
        <div
          onClick={(event) => handleClick(event)}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Typography>
            {tr.SurveyLanguageMenu.surveyLanguage} (
            {surveyLanguage?.toLocaleUpperCase()})
          </Typography>
          <ArrowDropDownIcon />
        </div>
      </Tooltip>
      <Menu
        style={{ display: !anchorEl ? 'none' : '' }}
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {languages.map((lang, index) => (
          <MenuItem
            key={`lang-item-${index}`}
            lang={lang}
            selected={lang === surveyLanguage}
            onClick={(event) => {
              handleClose();
              const targetLanguage = (event.target as HTMLInputElement)
                .lang as LanguageCode;
              setSurveyLanguage(targetLanguage);
              if (changeUILanguage) setLanguage(targetLanguage);
            }}
          >
            {tr.LanguageMenu[lang]} ({lang.toLocaleUpperCase()})
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
