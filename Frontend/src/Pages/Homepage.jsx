import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Link } from 'react-router-dom';

import starfort from './starfort.svg';

const features = [
  {
    title: 'Single state, single file',
    body: 'Everything lives inside one control object you can export or import at any time.',
  },
  {
    title: 'Weekly free-writing',
    body: 'Capture loose TODOs without micromanaging checkboxes or due dates.',
  },
  {
    title: 'Local-first by default',
    body: 'Data stays in cookies and travels with you as a simple JSON file.',
  },
];

const workflow = [
  {
    title: 'Capture',
    body: 'Dump thoughts into the week you are living in.',
  },
  {
    title: 'Review',
    body: 'Scan recent weeks to spot themes and open loops.',
  },
  {
    title: 'Archive',
    body: 'Export a JSON snapshot whenever you want a backup.',
  },
];

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export default function Homepage({ control }) {
  const todos = isPlainObject(control?.data?.todos) ? control.data.todos : {};
  const weekCount = Object.keys(todos).length;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <div style={{textAlign: "center"}}>
        <img src={starfort} alt="Citadel illustration" style={{ width: '100%', maxWidth: '150px', color: "red" }} />
        </div>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          p: { xs: 3, md: 6 },
          borderRadius: 4,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(130deg, rgba(125, 217, 199, 0.12) 0%, rgba(244, 180, 139, 0.12) 100%)'
              : 'linear-gradient(130deg, rgba(14, 59, 67, 0.08) 0%, rgba(224, 122, 95, 0.16) 100%)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark' ? '0 24px 50px rgba(0, 0, 0, 0.4)' : '0 24px 50px rgba(18, 29, 24, 0.12)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 'auto -20% -40% auto',
            width: 360,
            height: 360,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'radial-gradient(circle, rgba(125, 217, 199, 0.22) 0%, rgba(125, 217, 199, 0) 70%)'
                : 'radial-gradient(circle, rgba(14, 59, 67, 0.18) 0%, rgba(14, 59, 67, 0) 70%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '-30% auto auto -20%',
            width: 320,
            height: 320,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'radial-gradient(circle, rgba(244, 180, 139, 0.24) 0%, rgba(244, 180, 139, 0) 70%)'
                : 'radial-gradient(circle, rgba(224, 122, 95, 0.2) 0%, rgba(224, 122, 95, 0) 70%)',
          },
        }}
      >
        <Grid container spacing={4} sx={{ position: 'relative' }}>
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <Chip
                label="Personal management system"
                sx={{
                  width: 'fit-content',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(125, 217, 199, 0.18)' : 'rgba(14, 59, 67, 0.12)',
                  color: 'primary.main',
                  fontWeight: 600,
                }}
              />
              <Typography variant="h2" component="h1">
                Run your week from a single source of truth.
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Citadel keeps your planning lightweight: a weekly free-write, stored locally,
                and exportable whenever you want a clean snapshot. No accounts needed, no money required. <b>Always and forever free and open source.</b>
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button component={Link} to="/todo" variant="contained" size="large">
                  Open weekly TODO
                </Button>
                <Button component={Link} to="/todo" variant="outlined" size="large">
                  Start writing
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`${weekCount} weeks captured`} variant="outlined" />
                <Chip label="JSON export ready" variant="outlined" />
                <Chip label="Cookie-backed" variant="outlined" />
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(20, 28, 24, 0.92)' : 'rgba(255, 255, 255, 0.86)',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark' ? '0 22px 45px rgba(0, 0, 0, 0.5)' : '0 22px 45px rgba(18, 29, 24, 0.14)',
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h6">This week</Typography>
                <Divider />
                <Stack spacing={1}>
                  {['Finish TODO draft', 'Review next week priorities', 'Export snapshot'].map((item) => (
                    <Box
                      key={item}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark' ? 'rgba(125, 217, 199, 0.12)' : 'rgba(14, 59, 67, 0.06)',
                      }}
                    >
                      <Typography variant="body2">{item}</Typography>
                    </Box>
                  ))}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Drafted locally. Export when ready.
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3} sx={{ mt: { xs: 3, md: 5 } }}>
        {features.map((feature) => (
          <Grid item xs={12} md={4} key={feature.title}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(20, 28, 24, 0.85)' : 'rgba(255, 255, 255, 0.8)',
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === 'dark' ? 'rgba(231, 239, 232, 0.08)' : 'rgba(29, 37, 32, 0.08)'
                  }`,
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.body}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: { xs: 4, md: 6 } }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          How it flows
        </Typography>
        <Grid container spacing={3}>
          {workflow.map((item, index) => (
            <Grid item xs={12} md={4} key={item.title}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(140deg, rgba(20, 28, 24, 0.9) 0%, rgba(18, 23, 21, 0.7) 100%)'
                    : 'linear-gradient(140deg, rgba(255, 255, 255, 0.9) 0%, rgba(237, 242, 236, 0.7) 100%)',
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === 'dark' ? 'rgba(231, 239, 232, 0.08)' : 'rgba(29, 37, 32, 0.08)'
                  }`,
              }}
            >
                <Typography variant="overline" color="text.secondary">
                  Step {index + 1}
                </Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.body}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
