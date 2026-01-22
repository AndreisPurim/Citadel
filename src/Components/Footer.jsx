import React from 'react';

import Container from "@mui/material/Container";
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer(){
    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Divider sx={{ mb: 1, opacity: 0.6 }} />
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems="center"
                justifyContent="space-between"
            >
                <Typography variant="caption" color="text.secondary">
                    Citadel personal management system.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Local-first with JSON exports.
                </Typography>
            </Stack>
        </Container>
    )
}
