import React, { useMemo } from 'react';
import { Select, FormControl, MenuItem, InputLabel } from '@mui/material';
import { useTranslations } from '@src/stores/TranslationContext';
import { makeStyles } from '@mui/styles';
import ColorIndicator from './ColorIndicator';

interface Props {
  label?: string;
  value: string;
  onChange: (color: string) => void;
}

const useStyles = makeStyles({
  select: {
    minWidth: '10rem',
    width: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default function ColorSelect({ label, value, onChange }: Props) {
  const { tr } = useTranslations();
  const classes = useStyles();

  const colors = useMemo<{ name: string; value: string }[]>(
    () => [
      { name: tr.ColorSelect.colors.black, value: '#000000' },
      { name: tr.ColorSelect.colors.darkGray, value: '#3f3e3e' },
      { name: tr.ColorSelect.colors.steelBlue, value: '#0074a4' },
      { name: tr.ColorSelect.colors.atmosphere, value: '#c83e36' },
      { name: tr.ColorSelect.colors.berryRed, value: '#ad3963' },
      { name: tr.ColorSelect.colors.warmGreen, value: '#418155' },
    ],
    [tr],
  );

  return (
    <FormControl>
      <InputLabel id="color-select-label">
        {label ?? tr.ColorSelect.color}
      </InputLabel>
      <Select
        labelId="color-select-label"
        id="color"
        label={label ?? tr.ColorSelect.color}
        className={classes.select}
        classes={{
          select: classes.select,
        }}
        value={value == null ? colors[0].value : value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        {colors.map((color) => (
          <MenuItem key={color.value} value={color.value}>
            {color.name}
            <div style={{ flexGrow: 1 }} />
            <ColorIndicator color={color.value} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
