import { AccountCircleOutlined } from '@mui/icons-material';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import { useUser } from '@src/stores/UserContext';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { InstructionsDialog } from './InstructionsDialog';

const styles = {
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingLeft: '1.5rem',
  },
};

export default function AppBarUserMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>(null);
  const [instructionsDialogOpen, setInstructionsDialogOpen] = useState(false);
  const { activeUserIsAdmin, activeUser } = useUser();
  const history = useHistory();

  const { tr } = useTranslations();

  return (
    <Box sx={styles.root}>
      <Button
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={(event) => {
          setMenuOpen(!menuOpen);
          setMenuAnchorEl(event.currentTarget);
        }}
        endIcon={<AccountCircleOutlined />}
        color="inherit"
      >
        {activeUser?.fullName}
      </Button>

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
        {activeUserIsAdmin && (
          <MenuItem onClick={() => history.push('/karttajulkaisut')}>
            {tr.AppBarUserMenu.editMapPublications}
          </MenuItem>
        )}
        {activeUserIsAdmin && (
          <MenuItem onClick={() => setInstructionsDialogOpen(true)}>
            {tr.AppBarUserMenu.updateInstructions}
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setMenuOpen(false);
            window.location.pathname = '/logout';
          }}
        >
          {tr.AppBarUserMenu.logout}
        </MenuItem>
      </Menu>
      <InstructionsDialog
        isOpen={instructionsDialogOpen}
        setIsOpen={setInstructionsDialogOpen}
        setMenuOpen={setMenuOpen}
      />
    </Box>
  );
}
