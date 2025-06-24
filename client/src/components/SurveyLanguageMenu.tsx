import { Box, MenuItem, Select, Tooltip } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import { LanguageCode } from '@interfaces/survey';
import LanguageIcon from '@mui/icons-material/Language';
import React from 'react';

interface Props {
  style?: React.CSSProperties;
  changeUILanguage?: boolean;
}

const styles = {
  root: {
    cursor: 'pointer',
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
};

export default function SurveyLanguageMenu({
  style,
  changeUILanguage = false,
}: Props) {
  const { tr, setSurveyLanguage, setLanguage, languages, surveyLanguage } =
    useTranslations();

  return (
    <Box sx={styles.root} style={style}>
      <Tooltip
        arrow
        placement="left-end"
        title={tr.SurveyLanguageMenu.changeSurveyLanguage}
      >
        <Select
          inputProps={{ 'aria-label': tr.SurveyLanguageMenu.languageControl }}
          size="small"
          value={surveyLanguage}
          onChange={(event) => {
            const targetLanguage = event.target.value as LanguageCode;
            setSurveyLanguage(targetLanguage);
            if (changeUILanguage) setLanguage(targetLanguage);
          }}
          IconComponent={LanguageIcon}
          sx={{
            color: 'inherit',
            '&>.MuiSelect-select': {
              // Accommodate the larger globe icon
              paddingRight: '38px !important',
            },
            '&>fieldset': {
              display: 'none',
            },
            '& svg': {
              // The component is used in admin panel and survey, must adapt
              color: 'inherit',
              fill: 'currentColor',
            },
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
      </Tooltip>
    </Box>
  );
}
