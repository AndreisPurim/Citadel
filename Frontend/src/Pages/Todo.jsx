import React from 'react';

import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { getCurrentWeekValue } from '../utils/date';

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export default function Todo({ control, setControl }) {
  const [activeWeek, setActiveWeek] = React.useState(getCurrentWeekValue);
  const todos = isPlainObject(control?.data?.todos) ? control.data.todos : {};
  const weeks = React.useMemo(() => Object.keys(todos).sort((a, b) => b.localeCompare(a)), [todos]);
  const activeText = todos[activeWeek] || '';

  const handleWeekChange = (event) => {
    const value = event.target.value;
    if (value) {
      setActiveWeek(value);
    }
  };

  const handleTextChange = (event) => {
    const nextText = event.target.value;
    setControl((prev) => {
      const nextTodos = { ...(isPlainObject(prev.data?.todos) ? prev.data.todos : {}) };
      if (nextText.trim() === '') {
        delete nextTodos[activeWeek];
      } else {
        nextTodos[activeWeek] = nextText;
      }
      return { ...prev, data: { ...prev.data, todos: nextTodos } };
    });
  };

  const handleClear = () => {
    setControl((prev) => {
      const nextTodos = { ...(isPlainObject(prev.data?.todos) ? prev.data.todos : {}) };
      delete nextTodos[activeWeek];
      return { ...prev, data: { ...prev.data, todos: nextTodos } };
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1">
            Weekly TODO
          </Typography>
          <Typography variant="body2" color="text.secondary">
            App state is saved automatically to cookies. Use the navbar to export or import JSON.
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={6} sx={{ p: 2 }}>
            <Typography variant="h6">Saved weeks</Typography>
            <Divider sx={{ my: 1 }} />
            {weeks.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No weeks saved yet.
              </Typography>
            ) : (
              <List dense>
                {weeks.map((week) => (
                  <ListItem key={week} disablePadding>
                    <ListItemButton selected={week === activeWeek} onClick={() => setActiveWeek(week)}>
                      <ListItemText primary={week} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper elevation={6} sx={{ p: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="Week"
                type="week"
                value={activeWeek}
                onChange={handleWeekChange}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Notes"
                value={activeText}
                onChange={handleTextChange}
                multiline
                minRows={10}
                placeholder="Write your weekly TODO items here."
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button variant="outlined" onClick={handleClear}>
                  Clear week
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
