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
  RadioGroup,
  FormControl,
  FormLabel,
  Radio,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/api';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'buyer',
    acceptTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Họ tên không được để trống';
    if (!formData.email) newErrors.email = 'Email không được để trống';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.password) newErrors.password = 'Mật khẩu không được để trống';
    else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Bạn phải chấp nhận điều khoản';
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
      const response = await authService.register(
        formData.email,
        formData.password,
        formData.userType
      );
      const { user } = response.data;

      // Store token và user info (register response may or may not have token)
      // Login automatically after register
      const loginResponse = await authService.login(formData.email, formData.password);
      const { token } = loginResponse.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userType', formData.userType);
      localStorage.setItem('userId', user.id);

      // Dispatch custom event để Header cập nhật
      window.dispatchEvent(new CustomEvent('authChange', { detail: { isLoggedIn: true, userType: formData.userType } }));

      // Redirect to home
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Đăng Ký
      </Typography>
      <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
        Tạo tài khoản ShortDate ngay
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Full Name */}
        <TextField
          label="Họ Tên"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          error={!!errors.fullName}
          helperText={errors.fullName}
          disabled={loading}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
          }}
        />

        {/* Email */}
        <TextField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          disabled={loading}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
          }}
        />

        {/* User Type */}
        <FormControl disabled={loading}>
          <FormLabel sx={{ mb: 1, fontWeight: 600, fontSize: '0.9rem' }}>
            Bạn là:
          </FormLabel>
          <RadioGroup
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            sx={{ ml: 1 }}
          >
            <FormControlLabel value="buyer" control={<Radio size="small" />} label="Khách hàng" />
            <FormControlLabel
              value="supplier"
              control={<Radio size="small" />}
              label="Nhà cung cấp"
            />
          </RadioGroup>
        </FormControl>

        {/* Password */}
        <TextField
          label="Mật Khẩu"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          disabled={loading}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
          }}
        />

        {/* Confirm Password */}
        <TextField
          label="Xác Nhận Mật Khẩu"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          disabled={loading}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
          }}
        />

        {/* Terms */}
        <FormControlLabel
          control={
            <Checkbox
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              disabled={loading}
              size="small"
            />
          }
          label={
            <Typography variant="caption">
              Tôi đồng ý với{' '}
              <Link href="#" sx={{ color: '#4CAF50' }}>
                điều khoản dịch vụ
              </Link>
            </Typography>
          }
          error={!!errors.acceptTerms}
        />
        {errors.acceptTerms && (
          <Typography sx={{ color: '#F44336', fontSize: '0.75rem' }}>
            {errors.acceptTerms}
          </Typography>
        )}

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
            'Đăng Ký'
          )}
        </Button>
      </form>

      {/* Login Link */}
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        Đã có tài khoản?{' '}
        <Link
          onClick={() => navigate('/login')}
          sx={{ color: '#4CAF50', cursor: 'pointer', fontWeight: 600 }}
        >
          Đăng Nhập
        </Link>
      </Box>
    </Box>
  );
}
