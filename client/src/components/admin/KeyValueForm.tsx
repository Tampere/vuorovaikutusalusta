import { SurveyEmailInfoItem } from '@interfaces/survey';
import {
  Fab,
  FormLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@material-ui/core';
import { Add, Delete } from '@material-ui/icons';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';

interface Props {
  label?: string;
  value: SurveyEmailInfoItem[];
  onChange: (object: SurveyEmailInfoItem[]) => void;
}

export default function KeyValueForm({ label, value, onChange }: Props) {
  const { tr } = useTranslations();

  return (
    <div>
      {label && <FormLabel>{label}</FormLabel>}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{tr.KeyValueForm.key}</TableCell>
              <TableCell>{tr.KeyValueForm.value}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {value.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <TextField
                    variant="standard"
                    value={row.name}
                    onChange={(event) => {
                      value[index].name = event.target.value;
                      onChange(value);
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    variant="standard"
                    value={row.value}
                    onChange={(event) => {
                      value[index].value = event.target.value;
                      onChange(value);
                    }}
                  />
                </TableCell>
                <TableCell style={{ width: 0 }}>
                  <Tooltip title={tr.KeyValueForm.deleteEntry}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        onChange(value.filter((_, i) => i !== index));
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Tooltip title={tr.KeyValueForm.addEntry}>
        <Fab
          color="primary"
          aria-label="add-key-value-pair"
          size="small"
          style={{ margin: '1rem 0' }}
          onClick={() => {
            onChange([...value, { name: '', value: '' }]);
          }}
        >
          <Add />
        </Fab>
      </Tooltip>
    </div>
  );
}
