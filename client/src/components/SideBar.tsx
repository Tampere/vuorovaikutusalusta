import React, { ReactNode } from 'react';
import { Box, Divider, Drawer, Toolbar } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  paper: {
    // TODO: use theme colors?
    background: '#333',
    color: '#fafafa',
    fill: '#fafafa',
    '& *': {
      color: '#fafafa',
      fill: '#fafafa',
    },
    '& hr': {
      borderColor: '#555',
    },
    '& .Mui-selected': {
      backgroundColor: '#4e4e4e',
    },
    '& .MuiListItem-root:hover': {
      backgroundColor: '#747474',
    },
  },
});

interface Props {
  width: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  children: ReactNode;
}

export default function SideBar(props: Props) {
  const classes = useStyles();

  return (
    <Box
      component="nav"
      sx={{ width: { md: props.width }, flexShrink: { md: 0 } }}
      aria-label="navigation menu"
    >
      <Drawer
        classes={{
          paper: classes.paper,
        }}
        container={window.document.body}
        variant="temporary"
        open={props.mobileOpen}
        onClose={props.onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: props.width,
          },
        }}
      >
        <Toolbar />
        <Divider />
        {props.children}
      </Drawer>
      <Drawer
        classes={{
          paper: classes.paper,
        }}
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: props.width,
          },
        }}
        open
      >
        <Toolbar />
        <Divider />
        {props.children}
      </Drawer>
    </Box>
  );
}
