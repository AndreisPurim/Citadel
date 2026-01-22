import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { formatDuration, formatTime, getNextBreakStart, getSegmentInfo, playBell } from '../utils/pomodoro';

const DEFAULT_PREFS = {
  soundEnabled: true,
  notificationsEnabled: false,
  challenges: [],
  activeChallenge: '',
};

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export default function Pomodoro({ control, setControl, showAlert }) {
  const [now, setNow] = React.useState(() => new Date());
  const [newChallenge, setNewChallenge] = React.useState('');
  const [testChallenge, setTestChallenge] = React.useState('');
  const testTimerRef = React.useRef(null);

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const preferences = React.useMemo(() => {
    const saved = isPlainObject(control?.data?.pomodoro) ? control.data.pomodoro : {};
    return { ...DEFAULT_PREFS, ...saved };
  }, [control]);

  const updatePreferences = React.useCallback(
    (patch) => {
      setControl((prev) => {
        const saved = isPlainObject(prev.data?.pomodoro) ? prev.data.pomodoro : {};
        return {
          ...prev,
          data: {
            ...prev.data,
            pomodoro: { ...DEFAULT_PREFS, ...saved, ...patch },
          },
        };
      });
    },
    [setControl]
  );

  React.useEffect(() => {
    return () => {
      if (testTimerRef.current) {
        clearTimeout(testTimerRef.current);
      }
    };
  }, []);

  const handleToggleSound = (event) => {
    updatePreferences({ soundEnabled: event.target.checked });
  };

  const handleToggleNotifications = async (event) => {
    const nextValue = event.target.checked;
    if (!nextValue) {
      updatePreferences({ notificationsEnabled: false });
      return;
    }

    if (typeof Notification === 'undefined') {
      updatePreferences({ notificationsEnabled: false });
      if (showAlert) {
        showAlert({ severity: 'error', text: 'Notifications are not supported.', hide: true });
      }
      return;
    }

    if (Notification.permission === 'granted') {
      updatePreferences({ notificationsEnabled: true });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      updatePreferences({ notificationsEnabled: true });
      if (showAlert) {
        showAlert({ severity: 'success', text: 'Notifications enabled.', hide: true });
      }
    } else {
      updatePreferences({ notificationsEnabled: false });
      if (showAlert) {
        showAlert({ severity: 'warning', text: 'Notifications blocked.', hide: true });
      }
    }
  };

  const triggerTestBell = async () => {
    const challengePool = preferences.challenges.filter((item) => item.trim() !== '');
    const challenge = challengePool.length
      ? challengePool[Math.floor(Math.random() * challengePool.length)]
      : 'Stand up and stretch';
    setTestChallenge(challenge);
    if (testTimerRef.current) {
      clearTimeout(testTimerRef.current);
    }
    testTimerRef.current = setTimeout(() => setTestChallenge(''), 5 * 60 * 1000);

    if (preferences.soundEnabled) {
      playBell();
    }

    if (preferences.notificationsEnabled) {
      if (typeof Notification === 'undefined') {
        if (showAlert) {
          showAlert({ severity: 'error', text: 'Notifications are not supported.', hide: true });
        }
      } else if (Notification.permission === 'granted') {
        const end = new Date(Date.now() + 5 * 60 * 1000);
        new Notification('Test break', {
          body: `Try: ${challenge}. Back at ${formatTime(end)}.`,
        });
      } else if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const end = new Date(Date.now() + 5 * 60 * 1000);
          new Notification('Test break', {
            body: `Try: ${challenge}. Back at ${formatTime(end)}.`,
          });
        } else if (showAlert) {
          showAlert({ severity: 'warning', text: 'Notifications blocked.', hide: true });
        }
      } else if (showAlert) {
        showAlert({ severity: 'warning', text: 'Notifications blocked.', hide: true });
      }
    }

    if (showAlert) {
      showAlert({ severity: 'info', text: `Test bell: ${challenge}`, hide: true });
    }
  };

  const handleAddChallenge = () => {
    const trimmed = newChallenge.trim();
    if (!trimmed) {
      return;
    }
    updatePreferences({ challenges: [...preferences.challenges, trimmed] });
    setNewChallenge('');
  };

  const handleUpdateChallenge = (index, value) => {
    const next = preferences.challenges.map((item, idx) => (idx === index ? value : item));
    updatePreferences({ challenges: next });
  };

  const handleRemoveChallenge = (index) => {
    const next = preferences.challenges.filter((_, idx) => idx !== index);
    updatePreferences({ challenges: next });
  };

  const segment = getSegmentInfo(now);
  const nextBreak = getNextBreakStart(now);
  const remainingMs = segment.end.getTime() - now.getTime();
  const elapsedMs = now.getTime() - segment.start.getTime();
  const durationMs = segment.end.getTime() - segment.start.getTime();
  const progress = durationMs > 0 ? Math.min(100, Math.max(0, (elapsedMs / durationMs) * 100)) : 0;
  const activeChallengeLabel = testChallenge || preferences.activeChallenge;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h3">Pomodoro</Typography>
              <Typography variant="body2" color="text.secondary">
                Rings every hour at :25 and :55, then starts a five minute break.
              </Typography>
            </Box>
            <Chip
              label={segment.mode === 'break' ? 'Break' : 'Focus'}
              color={segment.mode === 'break' ? 'secondary' : 'primary'}
              sx={{ fontWeight: 600, px: 1 }}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(29, 37, 32, 0.08)' }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="baseline">
                <Typography variant="h2">{formatTime(now)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {now.toLocaleDateString()}
                </Typography>
              </Stack>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle1">
                  {segment.mode === 'break' ? 'Break ends in' : 'Next break in'}
                </Typography>
                <Typography variant="h4">{formatDuration(remainingMs)}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 10, borderRadius: 999 }}
                  color={segment.mode === 'break' ? 'secondary' : 'primary'}
                />
                <Typography variant="caption" color="text.secondary">
                  {segment.mode === 'break'
                    ? `Back at ${formatTime(segment.end)}. Next ring at ${formatTime(nextBreak)}.`
                    : `Next ring at ${formatTime(nextBreak)}. Break ends at ${formatTime(segment.end)}.`}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(29, 37, 32, 0.08)' }}>
            <Stack spacing={2}>
              <Typography variant="h6">Alerts</Typography>
              <FormControlLabel
                control={<Switch checked={preferences.soundEnabled} onChange={handleToggleSound} />}
                label="Sound bell"
              />
              <FormControlLabel
                control={<Switch checked={preferences.notificationsEnabled} onChange={handleToggleNotifications} />}
                label="Desktop notification"
              />
              <Button variant="outlined" onClick={triggerTestBell}>
                Test bell + challenge
              </Button>
              <Typography variant="caption" color="text.secondary">
                Keep the app open to receive alerts. Desktop notifications require permission.
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(29, 37, 32, 0.08)' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <Stack spacing={1}>
                  <Typography variant="overline" color="text.secondary">
                    Break challenges
                  </Typography>
                  <Typography variant="body2">
                    Current: {activeChallengeLabel || 'No challenge assigned.'}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      label="New challenge"
                      value={newChallenge}
                      onChange={(event) => setNewChallenge(event.target.value)}
                      fullWidth
                    />
                    <Button variant="contained" onClick={handleAddChallenge}>
                      Add
                    </Button>
                  </Stack>
                  <Stack spacing={1}>
                    {preferences.challenges.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        Add a few ideas and the system will randomize them during breaks.
                      </Typography>
                    ) : (
                      preferences.challenges.map((challenge, index) => (
                        <Stack key={`${challenge}-${index}`} direction="row" spacing={1} alignItems="center">
                          <TextField
                            size="small"
                            value={challenge}
                            onChange={(event) => handleUpdateChallenge(index, event.target.value)}
                            fullWidth
                          />
                          <IconButton onClick={() => handleRemoveChallenge(index)}>
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Stack>
                      ))
                    )}
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} md={7}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="overline" color="text.secondary">
                      Focus windows
                    </Typography>
                    <Typography variant="body2">00:00 - 00:25</Typography>
                    <Typography variant="body2">00:30 - 00:55</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="overline" color="text.secondary">
                      Break windows
                    </Typography>
                    <Typography variant="body2">00:25 - 00:30</Typography>
                    <Typography variant="body2">00:55 - 01:00</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="overline" color="text.secondary">
                      Trigger points
                    </Typography>
                    <Typography variant="body2">:25 every hour</Typography>
                    <Typography variant="body2">:55 every hour</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
