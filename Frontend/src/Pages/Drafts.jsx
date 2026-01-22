import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const createDraftId = () => `draft-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;

export default function Drafts({ control, setControl }) {
  const drafts = isPlainObject(control?.data?.drafts) ? control.data.drafts : { activeId: null, items: [] };
  const items = Array.isArray(drafts.items) ? drafts.items : [];
  const activeId = drafts.activeId || (items[0] ? items[0].id : null);
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const activeDraft = activeIndex >= 0 ? items[activeIndex] : null;

  const updateDrafts = (nextDrafts) => {
    setControl((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        drafts: nextDrafts,
      },
    }));
  };

  const handleAddDraft = () => {
    const id = createDraftId();
    const nextItems = [
      ...items,
      { id, title: `Draft ${items.length + 1}`, content: '' },
    ];
    updateDrafts({ activeId: id, items: nextItems });
  };

  const handleDeleteDraft = () => {
    if (!activeDraft) {
      return;
    }
    const nextItems = items.filter((item) => item.id !== activeDraft.id);
    const nextActiveId = nextItems[activeIndex] ? nextItems[activeIndex].id : nextItems[activeIndex - 1]?.id || null;
    updateDrafts({ activeId: nextActiveId, items: nextItems });
  };

  const handleTabChange = (event, value) => {
    updateDrafts({ ...drafts, activeId: value });
  };

  const handleTitleChange = (event) => {
    if (!activeDraft) {
      return;
    }
    const nextItems = items.map((item) =>
      item.id === activeDraft.id ? { ...item, title: event.target.value } : item
    );
    updateDrafts({ activeId, items: nextItems });
  };

  const handleContentChange = (event) => {
    if (!activeDraft) {
      return;
    }
    const nextItems = items.map((item) =>
      item.id === activeDraft.id ? { ...item, content: event.target.value } : item
    );
    updateDrafts({ activeId, items: nextItems });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h3">Drafts</Typography>
          <Typography variant="body2" color="text.secondary">
            Free-form scratch pads saved inside your main JSON export.
          </Typography>
        </Box>
        <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(29, 37, 32, 0.08)' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <Tabs
              value={activeId || false}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ flexGrow: 1 }}
            >
              {items.map((item) => (
                <Tab key={item.id} label={item.title || 'Untitled'} value={item.id} />
              ))}
            </Tabs>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleAddDraft}>
                New tab
              </Button>
              <IconButton onClick={handleDeleteDraft} disabled={!activeDraft}>
                <DeleteOutlineIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Paper>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(29, 37, 32, 0.08)' }}>
          {activeDraft ? (
            <Stack spacing={2}>
              <TextField
                label="Title"
                value={activeDraft.title}
                onChange={handleTitleChange}
                fullWidth
              />
              <TextField
                label="Draft"
                value={activeDraft.content}
                onChange={handleContentChange}
                multiline
                minRows={12}
                placeholder="Paste or jot anything here."
              />
            </Stack>
          ) : (
            <Stack spacing={2} alignItems="flex-start">
              <Typography variant="body1">No drafts yet.</Typography>
              <Button variant="contained" onClick={handleAddDraft}>
                Create first draft
              </Button>
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
