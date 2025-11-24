import { Room } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';
import React from 'react';

/**
 * Placeholder icon for geo-budgeting questions.
 * Uses MUI Room icon until a proper custom icon is provided by the designer.
 */
export default function GeoBudgetingIcon(props: SvgIconProps) {
  return <Room {...props} />;
}
