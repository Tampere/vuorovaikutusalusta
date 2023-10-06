import { Backdrop, Box, Button } from '@mui/material';
import React from 'react';
import { AdminMap } from './AdminMap';
import { SurveyPage } from '@interfaces/survey';

interface Props {
  isOpen: boolean;
  url: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSave: () => void;
  page: SurveyPage;
}

export function AdminSurveyMapPreview({
  isOpen,
  setIsOpen,
  url,
  handleSave,
  page,
}: Props) {
  return (
    <Backdrop
      open={isOpen}
      sx={{
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        className="map-container"
        sx={{ width: '70%', height: '70vh', borderRadius: 5 }}
      >
        <Box
          sx={{ backgroundColor: 'white' }}
          className="map-preview-header"
        ></Box>
        {isOpen && <AdminMap url={url} page={page} />}
        <Box
          sx={{
            backgroundColor: 'white',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          className="map-preview-footer"
        >
          <Button onClick={() => setIsOpen(false)}>close</Button>
          <Button
            onClick={() => {
              handleSave();
              setIsOpen(false);
            }}
          >
            tallenna
          </Button>
        </Box>
      </Box>
    </Backdrop>
  );
}
