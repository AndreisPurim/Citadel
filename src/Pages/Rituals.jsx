import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { getCurrentWeekValue } from '../utils/date';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const createItemId = () => `ritual-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;

const emptyWeek = () => ({ items: [], checks: {} });

export default function Rituals({ control, setControl }) {
  const rituals = isPlainObject(control?.data?.rituals) ? control.data.rituals : { activeWeek: null, weeks: {} };
  const weeks = isPlainObject(rituals.weeks) ? rituals.weeks : {};
  const activeWeek = rituals.activeWeek || getCurrentWeekValue();
  const weekData = isPlainObject(weeks[activeWeek]) ? weeks[activeWeek] : emptyWeek();
  const items = Array.isArray(weekData.items) ? weekData.items : [];
  const checks = isPlainObject(weekData.checks) ? weekData.checks : {};

  const updateWeekData = (nextWeekData, nextWeek = activeWeek) => {
    setControl((prev) => {
      const prevRituals = isPlainObject(prev.data?.rituals) ? prev.data.rituals : { activeWeek: null, weeks: {} };
      const prevWeeks = isPlainObject(prevRituals.weeks) ? prevRituals.weeks : {};
      return {
        ...prev,
        data: {
          ...prev.data,
          rituals: {
            ...prevRituals,
            activeWeek: nextWeek,
            weeks: {
              ...prevWeeks,
              [nextWeek]: nextWeekData,
            },
          },
        },
      };
    });
  };

  const handleWeekChange = (event) => {
    const value = event.target.value;
    if (!value) {
      return;
    }
    const nextWeekData = isPlainObject(weeks[value]) ? weeks[value] : emptyWeek();
    updateWeekData(nextWeekData, value);
  };

  const handleAddItem = () => {
    const id = createItemId();
    const nextItems = [...items, { id, title: `Ritual ${items.length + 1}` }];
    updateWeekData({ ...weekData, items: nextItems });
  };

  const handleRemoveItem = (id) => {
    const nextItems = items.filter((item) => item.id !== id);
    const nextChecks = { ...checks };
    delete nextChecks[id];
    updateWeekData({ ...weekData, items: nextItems, checks: nextChecks });
  };

  const handleItemTitleChange = (id, value) => {
    const nextItems = items.map((item) => (item.id === id ? { ...item, title: value } : item));
    updateWeekData({ ...weekData, items: nextItems });
  };

  const handleToggleCheck = (id, dayIndex) => {
    const nextChecks = { ...checks };
    const dayChecks = isPlainObject(nextChecks[id]) ? { ...nextChecks[id] } : {};
    dayChecks[dayIndex] = !dayChecks[dayIndex];
    nextChecks[id] = dayChecks;
    updateWeekData({ ...weekData, checks: nextChecks });
  };

  const totalItems = items.length;
  const dayScores = days.map((_, dayIndex) => {
    if (!totalItems) {
      return 0;
    }
    const completed = items.reduce((sum, item) => sum + (checks[item.id]?.[dayIndex] ? 1 : 0), 0);
    return Math.round((completed / totalItems) * 100);
  });
  const totalChecks = items.reduce((sum, item) => {
    return sum + days.reduce((daySum, _, dayIndex) => daySum + (checks[item.id]?.[dayIndex] ? 1 : 0), 0);
  }, 0);
  const totalPossible = totalItems * days.length;
  const weekScore = totalPossible ? Math.round((totalChecks / totalPossible) * 100) : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h3">Daily Rituals</Typography>
          <Typography variant="body2" color="text.secondary">
            Build a weekly checklist, track daily completion, and keep a weekly score.
          </Typography>
        </Box>
        <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(29, 37, 32, 0.08)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <TextField
              label="Week"
              type="week"
              value={activeWeek}
              onChange={handleWeekChange}
              InputLabelProps={{ shrink: true }}
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Week score: {weekScore}%
              </Typography>
              <Button variant="contained" onClick={handleAddItem}>
                Add ritual
              </Button>
            </Stack>
          </Stack>
        </Paper>
        <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(29, 37, 32, 0.08)' }}>
          {items.length === 0 ? (
            <Stack spacing={2} alignItems="flex-start">
              <Typography variant="body1">No rituals yet.</Typography>
              <Button variant="contained" onClick={handleAddItem}>
                Create first ritual
              </Button>
            </Stack>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 240 }}>Ritual</TableCell>
                  {days.map((day, index) => (
                    <TableCell key={day} align="center">
                      <Stack spacing={0.5} alignItems="center">
                        <Typography variant="caption">{day}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayScores[index]}%
                        </Typography>
                      </Stack>
                    </TableCell>
                  ))}
                  <TableCell align="center">Remove</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <TextField
                        value={item.title}
                        onChange={(event) => handleItemTitleChange(item.id, event.target.value)}
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    {days.map((day, dayIndex) => (
                      <TableCell key={`${item.id}-${day}`} align="center">
                        <Checkbox
                          checked={Boolean(checks[item.id]?.[dayIndex])}
                          onChange={() => handleToggleCheck(item.id, dayIndex)}
                        />
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <IconButton onClick={() => handleRemoveItem(item.id)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
