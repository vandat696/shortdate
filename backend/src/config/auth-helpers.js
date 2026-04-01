import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Hash password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// So sánh password
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Tạo JWT token
export const generateToken = (userId, userType) => {
  return jwt.sign(
    { userId, userType },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;
    console.log('[AUTH-HELPERS] Verifying token with secret:', secret ? secret.substring(0, 10) + '...' : 'UNDEFINED');
    console.log('[AUTH-HELPERS] Token to verify:', token.substring(0, 20) + '...');
    const verified = jwt.verify(token, secret);
    console.log('[AUTH-HELPERS] Token verified successfully');
    return verified;
  } catch (err) {
    console.error('[AUTH-HELPERS] Token verification failed:', err.message);
    return null;
  }
};
