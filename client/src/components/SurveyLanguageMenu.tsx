import { MenuItem, Select } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import { LanguageCode } from '@interfaces/survey';
import { makeStyles } from '@mui/styles';
import LanguageIcon from '@mui/icons-material/Language';
import React from 'react';

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
  const classes = useStyles();

  return (
    <div className={classes.root} style={style}>
      <Select
        inputProps={{"aria-label": tr.SurveyLanguageMenu.languageControl}}
        value={surveyLanguage}
        onChange={(event) => {
          const targetLanguage = event.target.value as LanguageCode;
          setSurveyLanguage(targetLanguage);
          if (changeUILanguage) setLanguage(targetLanguage);
        }}
        IconComponent={LanguageIcon}
        sx={{
          /* Visual label not used, hide the border and legend */
          '& fieldset': {
            borderWidth: 0,
            '&>legend': {display: 'none'}
          }
        }}
      >
        {languages.map((lang, index) => (
          <MenuItem
            key={`lang-item-${index}`}
            value={lang}
            selected={lang === surveyLanguage}
          >
            {tr.LanguageMenu[lang]} ({lang.toLocaleUpperCase()})
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}
