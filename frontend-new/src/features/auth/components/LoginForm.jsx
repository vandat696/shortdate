import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/api';

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email không được để trống';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!password) newErrors.password = 'Mật khẩu không được để trống';
    else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});

    // Validate
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      console.log('[LoginForm] Attempting login with:', { email });
      const response = await authService.login(email, password);
      console.log('[LoginForm] Login response:', response);
      const { token, user } = response.data;

      // Store token và user info
      localStorage.setItem('token', token);
      localStorage.setItem('userType', user.userType);
      localStorage.setItem('userId', user.id);
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      }

      console.log('[LoginForm] Auth data saved, dispatching authChange event');
      // Dispatch custom event để Header cập nhật
      window.dispatchEvent(new CustomEvent('authChange', { detail: { isLoggedIn: true, userType: user.userType } }));

      // Redirect to home
      navigate('/');
    } catch (err) {
      console.error('[LoginForm] Error:', err);
      console.error('[LoginForm] Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        maxWidth: '400px',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Đăng Nhập
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Email */}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
          disabled={loading}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />

        {/* Password */}
        <TextField
          label="Mật Khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!errors.password}
          helperText={errors.password}
          disabled={loading}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />

        {/* Remember Me */}
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              size="small"
            />
          }
          label="Ghi nhớ email"
          sx={{ mt: -1 }}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            backgroundColor: '#4CAF50',
            color: '#FFFFFF',
            fontWeight: 600,
            py: 1.2,
            mt: 1,
            '&:hover': { backgroundColor: '#45a049' },
            '&:disabled': { backgroundColor: '#BDBDBD' },
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Đang xử lý...
            </>
          ) : (
            'Đăng Nhập'
          )}
        </Button>
      </form>

      {/* Links */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Link
          href="/forgot-password"
          sx={{ color: '#4CAF50', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          Quên mật khẩu?
        </Link>
        <Box>
          Chưa có tài khoản?{' '}
          <Link
            onClick={() => navigate('/register')}
            sx={{ color: '#4CAF50', cursor: 'pointer', fontWeight: 600 }}
          >
            Đăng Ký
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
