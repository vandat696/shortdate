import { Box, Container, Paper } from '@mui/material';
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
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
          <RegisterForm />
        </Paper>
      </Box>
    </Container>
  );
}
