import { verifyToken } from '../config/auth-helpers.js';

// Optional authentication - không ném lỗi nếu không có token
const authenticateOptional = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // "Bearer token"
    
    if (token) {
      console.log('[AUTH_OPT] Token found, verifying...');
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
        console.log('[AUTH_OPT] User authenticated:', decoded.userId);
      }
    } else {
      console.log('[AUTH_OPT] No token provided, proceeding as guest');
    }
    
    next();
  } catch (err) {
    console.error('[AUTH_OPT] Error:', err.message);
    // Không ném lỗi, tiếp tục như guest
    next();
  }
};

export const authenticateOptionalToken = authenticateOptional;
export const authenticateTokenOptional = authenticateOptional;
export default authenticateOptional;
