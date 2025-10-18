import React from 'react';
import { AccountBalanceWallet } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

/**
 * Placeholder icon for budgeting questions.
 * Uses MUI AccountBalanceWallet icon until a proper custom icon is provided by the designer.
 */
export default function BudgetingIcon(props: SvgIconProps) {
  return <AccountBalanceWallet {...props} />;
}
