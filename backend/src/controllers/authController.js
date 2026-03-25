import User from '../models/User.js';
import { hashPassword, comparePassword, generateToken } from '../config/auth-helpers.js';

// Validation helpers
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6; // Tối thiểu 6 ký tự
};

// ĐĂNG KÝ
export const register = async (req, res) => {
  try {
    const { email, password, userType = 'buyer' } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Hash password và tạo user
    const passwordHash = await hashPassword(password);
    const newUser = await User.create(email, passwordHash, userType);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        userType: newUser.user_type
      }
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed', message: err.message });
  }
};

// ĐĂNG NHẬP
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Tìm user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Kiểm tra tài khoản bị khóa
    const isLocked = await User.isAccountLocked(user.id);
    if (isLocked) {
      const lockedUser = await User.findById(user.id);
      const pool = (await import('../config/database.js')).default;
      const query = 'SELECT locked_until FROM users WHERE id = $1';
      const result = await pool.query(query, [user.id]);
      const lockedUntil = new Date(result.rows[0].locked_until);
      const minutesLeft = Math.ceil((lockedUntil - new Date()) / 60000);
      return res.status(423).json({ 
        error: `Account locked for ${minutesLeft} minutes` 
      });
    }

    // Kiểm tra password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = await User.incrementFailedLogin(user.id);
      
      if (failedAttempts.failed_login_attempts >= 5) {
        // Khóa tài khoản
        await User.lockAccount(user.id, 15);
        return res.status(423).json({ 
          error: 'Account locked due to too many failed attempts. Try again in 15 minutes.' 
        });
      }

      return res.status(401).json({ 
        error: 'Invalid email or password',
        attemptsLeft: 5 - failedAttempts.failed_login_attempts
      });
    }

    // Mở khóa nếu login thành công
    if (user.failed_login_attempts > 0) {
      await User.unlockAccount(user.id);
    }

    // Tạo token
    const token = generateToken(user.id, user.user_type);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        userType: user.user_type,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed', message: err.message });
  }
};

// LẤY THÔNG TIN USER (cần auth)
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Từ middleware auth
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      user
    });
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(500).json({ error: 'Failed to get profile', message: err.message });
  }
};

// XÁC MINH EMAIL (dùng token trong email)
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    // TODO: Verify token từ email
    // Để demo, ta sẽ dùng userId trực tiếp
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    await User.verifyEmail(userId);

    res.status(200).json({
      message: 'Email verified successfully'
    });
  } catch (err) {
    console.error('Verify email error:', err.message);
    res.status(500).json({ error: 'Email verification failed', message: err.message });
  }
};
