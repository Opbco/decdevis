import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    Divider,
    Button
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Box
            display="grid"
            style={{ placeItems: "center", minHeight: "100vh" }}
        >
            <Stack direction="row" alignItems="center" gap={2}>
                <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} size="large" variant="text">
                    Go Back
                </Button>
                <Divider orientation="vertical" flexItem />
                <Typography variant="body1" color="primary">
                    Sorry, we couldn’t find the page you’re looking for. Perhaps you’ve mistyped the URL? Be
                    sure to check your spelling.
                </Typography>
            </Stack>
        </Box>
    )
}

export default NotFound