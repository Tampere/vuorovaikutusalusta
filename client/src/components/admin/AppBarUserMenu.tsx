import React, { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
});

export default function AppBarUserMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>(null);

  const classes = useStyles();
  const { tr } = useTranslations();

  return (
    <div className={classes.root}>
      <IconButton
        aria-label="user menu"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={(event) => {
          setMenuOpen(!menuOpen);
          setMenuAnchorEl(event.currentTarget);
        }}
        color="inherit"
      >
        <AccountCircle />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={menuAnchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
        }}
      >
        <MenuItem
          onClick={() => {
            setMenuOpen(false);
            window.location.pathname = '/logout';
          }}
        >
          {tr.AppBarUserMenu.logout}
        </MenuItem>
      </Menu>
    </div>
  );
}
