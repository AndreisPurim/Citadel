import React from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Brightness2Icon from '@mui/icons-material/Brightness2';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

import { Link, useLocation } from 'react-router-dom';

import { formatDuration, formatTime, getBreakWindow, getNextBreakStart, getSegmentInfo, playBell } from '../utils/pomodoro';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Weekly TODO', to: '/todo' },
  { label: 'Pomodoro', to: '/pomodoro' },
  { label: 'Drafts', to: '/drafts' },
  { label: 'Rituals', to: '/rituals' },
];

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export default function Navbar({ lightMode, setLightMode, control, setControl, showAlert }) {
  const location = useLocation();
  const [now, setNow] = React.useState(() => new Date());
  const lastTriggerRef = React.useRef('');

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const pomodoro = React.useMemo(() => {
    const base = isPlainObject(control?.data?.pomodoro) ? control.data.pomodoro : {};
    return {
      soundEnabled: base.soundEnabled !== false,
      notificationsEnabled: Boolean(base.notificationsEnabled),
      challenges: Array.isArray(base.challenges) ? base.challenges : [],
      activeChallenge: typeof base.activeChallenge === 'string' ? base.activeChallenge : '',
    };
  }, [control]);

  const segment = getSegmentInfo(now);
  const nextBreak = getNextBreakStart(now);
  const remainingMs = segment.end.getTime() - now.getTime();

  React.useEffect(() => {
    const minute = now.getMinutes();
    if (minute !== 25 && minute !== 55) {
      return;
    }
    const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${minute}`;
    if (lastTriggerRef.current === key) {
      return;
    }
    lastTriggerRef.current = key;

    const challengePool = pomodoro.challenges.filter((item) => item.trim() !== '');
    const nextChallenge =
      challengePool.length > 0 ? challengePool[Math.floor(Math.random() * challengePool.length)] : '';

    setControl((prev) => ({
      ...prev,
      data: {
        ...(prev.data || {}),
        pomodoro: {
          ...((prev.data && prev.data.pomodoro) || {}),
          activeChallenge: nextChallenge,
        },
      },
    }));

    if (pomodoro.soundEnabled) {
      playBell();
    }

    if (pomodoro.notificationsEnabled && typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') {
        const end = getBreakWindow(now).end;
        new Notification('Break time', {
          body: `Stop for five minutes. Back at ${formatTime(end)}.${nextChallenge ? ` Challenge: ${nextChallenge}` : ''}`,
        });
      }
    }

    if (showAlert) {
      showAlert({
        severity: 'info',
        text: nextChallenge ? `Break time: ${nextChallenge}` : 'Break time. Take five.',
        hide: true,
      });
    }
  }, [now, pomodoro, setControl, showAlert]);

  const handleExport = () => {
    const payload = control || {};
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pms-control.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!isPlainObject(parsed)) {
          throw new Error('Invalid JSON');
        }
        setControl(parsed);
        if (showAlert) {
          showAlert({ severity: 'success', text: 'State imported.', hide: true });
        }
      } catch (error) {
        if (showAlert) {
          showAlert({ severity: 'error', text: 'Invalid JSON file.', hide: true });
        }
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const pomodoroLabel = `${segment.mode === 'break' ? 'Break' : 'Focus'} ${formatDuration(remainingMs)}`;
  const pomodoroTooltip = segment.mode === 'break'
    ? `Break ends at ${formatTime(segment.end)}.${pomodoro.activeChallenge ? ` Challenge: ${pomodoro.activeChallenge}` : ''}`
    : `Next break at ${formatTime(nextBreak)}.`;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        backdropFilter: 'blur(14px)',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(12, 18, 16, 0.9)' : 'rgba(247, 243, 238, 0.86)',
        borderBottom: (theme) =>
          `1px solid ${
            theme.palette.mode === 'dark' ? 'rgba(231, 239, 232, 0.08)' : 'rgba(29, 37, 32, 0.08)'
          }`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1.5, gap: 2, alignItems: 'center' }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
            <Box
              component={Link}
              to="/"
              sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Typography
                variant="h6"
                sx={{ fontFamily: '"Fraunces", serif', fontWeight: 800, letterSpacing: '-0.02em' }}
              >
                Citadel
              </Typography>
              <Chip
                label="(by Andreis)"
                size="small"
                sx={{
                  fontWeight: 600,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(125, 217, 199, 0.18)' : 'rgba(14, 59, 67, 0.12)',
                  color: 'primary.main',
                }}
              />
            </Box>
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {navItems.map((item) => (
                <Button
                  key={item.to}
                  component={Link}
                  to={item.to}
                  variant={location.pathname === item.to ? 'outlined' : 'text'}
                  color="primary"
                  sx={{ borderRadius: 999, px: 2 }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={pomodoroTooltip}>
              <Button
                component={Link}
                to="/pomodoro"
                variant={segment.mode === 'break' ? 'contained' : 'outlined'}
                color={segment.mode === 'break' ? 'secondary' : 'primary'}
                size="small"
                startIcon={<AccessTimeIcon />}
                sx={{ borderRadius: 999, px: 2 }}
              >
                {pomodoroLabel}
              </Button>
            </Tooltip>
            <Tooltip title="Export JSON">
              <IconButton onClick={handleExport} color="primary">
                <FileDownloadOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Import JSON">
              <IconButton component="label" color="primary">
                <FileUploadOutlinedIcon />
                <input hidden accept="application/json" type="file" onChange={handleImport} />
              </IconButton>
            </Tooltip>
            <Tooltip title={lightMode === 'dark' ? 'Switch to light' : 'Switch to dark'}>
              <IconButton onClick={() => setLightMode(lightMode === 'light' ? 'dark' : 'light')} color="primary">
                {lightMode === 'dark' ? <Brightness2Icon /> : <WbSunnyIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
        <Stack direction="row" spacing={1} sx={{ pb: 1, display: { xs: 'flex', md: 'none' } }}>
          {navItems.map((item) => (
            <Button
              key={item.to}
              component={Link}
              to={item.to}
              variant={location.pathname === item.to ? 'outlined' : 'text'}
              color="primary"
              size="small"
              sx={{ borderRadius: 999, px: 2 }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </Container>
    </AppBar>
  );
}
