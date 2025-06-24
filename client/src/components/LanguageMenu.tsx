import { Box, MenuItem, Select, Tooltip } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import { LanguageCode } from '@interfaces/survey';
import LanguageIcon from '@mui/icons-material/Language';
import React from 'react';

interface Props {
  style?: React.CSSProperties;
}

const styles = {
  root: {
    cursor: 'pointer',
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
};

export default function LanguageMenu({ style }: Props) {
  const { tr, setLanguage, languages, language } = useTranslations();

  return (
    <Box sx={styles.root} style={style}>
      <Tooltip
        arrow
        placement="left-end"
        title={tr.LanguageMenu.changeLanguage}
      >
        <Select
          inputProps={{ 'aria-label': tr.LanguageMenu.languageControl }}
          value={language}
          onChange={(event) => {
            const targetLanguage = event.target.value as LanguageCode;
            setLanguage(targetLanguage);
          }}
          IconComponent={LanguageIcon}
          sx={{
            color: 'inherit',
            '&>.MuiSelect-select': {
              // Accommodate the larger globe icon
              paddingRight: '38px !important',
            },
            '&>fieldset': {
              // Visual label not used, hide border and legend
              borderWidth: 0,
              '&>legend': { display: 'none' },
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
              selected={lang === language}
            >
              {tr.LanguageMenu[lang]} ({lang.toLocaleUpperCase()})
            </MenuItem>
          ))}
        </Select>
      </Tooltip>
    </Box>
  );
}
