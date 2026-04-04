import { Box, Container, Paper } from '@mui/material';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 8,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: '12px',
            width: '100%',
            backgroundColor: '#FFFFFF',
          }}
        >
          <LoginForm />
        </Paper>
      </Box>
    </Container>
  );
}
