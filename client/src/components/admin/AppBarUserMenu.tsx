import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { makeStyles } from '@mui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import { InstructionsDialog } from './InstructionsDialog';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
});

export default function AppBarUserMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>(null);
  const [instructionsDialogOpen, setInstructionsDialogOpen] = useState(false);

  const classes = useStyles();
  const { tr } = useTranslations();

  return (
    <div className={classes.root}>
      <Tooltip arrow title={tr.AppBarUserMenu.label}>
        <IconButton
          aria-label={tr.AppBarUserMenu.label}
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={(event) => {
            setMenuOpen(!menuOpen);
            setMenuAnchorEl(event.currentTarget);
          }}
          color="inherit"
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <Menu
        sx={{ padding: '4px', transform: 'translateX(15px)' }}
        id="menu-appbar"
        anchorEl={menuAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 0,
          horizontal: 0,
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
        <MenuItem onClick={() => setInstructionsDialogOpen(true)}>
          {tr.AppBarUserMenu.updateInstructions}
        </MenuItem>
      </Menu>
      <InstructionsDialog
        isOpen={instructionsDialogOpen}
        setIsOpen={setInstructionsDialogOpen}
        setMenuOpen={setMenuOpen}
      />
    </div>
  );
}
