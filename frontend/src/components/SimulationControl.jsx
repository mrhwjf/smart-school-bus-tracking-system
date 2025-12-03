import React from 'react';
import { Box, Button, Chip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

export default function SimulationControl({ 
  isRunning, 
  activeCount, 
  onStart, 
  onStop, 
  size = 'medium',
  loading = false 
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {isRunning ? (
        <>
          <Button
            variant="contained"
            color="error"
            size={size}
            startIcon={<StopIcon />}
            onClick={onStop}
            disabled={loading}
          >
            Dừng mô phỏng
          </Button>
          {activeCount > 0 && (
            <Chip
              label={`${activeCount} xe đang chạy`}
              color="success"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </>
      ) : (
        <Button
          variant="contained"
          color="primary"
          size={size}
          startIcon={<PlayArrowIcon />}
          onClick={onStart}
          disabled={loading}
        >
          Bắt đầu mô phỏng
        </Button>
      )}
    </Box>
  );
}
