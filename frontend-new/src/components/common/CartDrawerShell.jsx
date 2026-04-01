import { Box } from '@mui/material';

export default function CartDrawerShell() {
  // Hidden by default; used as a design anchor matching Figma/CSS.
  return (
    <Box
      aria-hidden
      sx={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: 0,
        isolation: 'isolate',
        position: 'absolute',
        width: 320,
        height: 1927,
        right: -320,
        top: 0,
        background: '#FFFFFF',
        borderLeft: '1px solid rgba(191, 202, 186, 0.15)',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  );
}

