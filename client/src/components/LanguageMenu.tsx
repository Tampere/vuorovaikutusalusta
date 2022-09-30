import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { useTranslations } from '@src/stores/TranslationContext';
import { LanguageCode } from '@interfaces/survey';
import { makeStyles } from '@material-ui/styles';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

interface Props {
  style?: React.CSSProperties;
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
});

export default function LanguageMenu({ style }: Props) {
  const { tr, setLanguage, languages, language } = useTranslations();
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
      <Tooltip title={tr.LanguageMenu.changeLanguage}>
        <IconButton
          id="basic-button"
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          color="inherit"
        >
          <Typography>{language.toLocaleUpperCase()}</Typography>
          <ArrowDropDownIcon />
        </IconButton>
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
            selected={lang === language}
            onClick={(event) => {
              handleClose();
              const target = event.target as HTMLInputElement;
              setLanguage(target.lang as LanguageCode);
            }}
          >
            {tr.LanguageMenu[lang]} ({lang.toLocaleUpperCase()})
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
