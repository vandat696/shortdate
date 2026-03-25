import { verifyToken } from '../config/auth-helpers.js';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('[AUTH] Authorization header:', authHeader);
    
    const token = authHeader?.split(' ')[1]; // "Bearer token"
    
    if (!token) {
      console.log('[AUTH] No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('[AUTH] Token:', token.substring(0, 20) + '...');
    const decoded = verifyToken(token);
    console.log('[AUTH] Decoded token:', decoded);
    
    if (!decoded) {
      console.log('[AUTH] Invalid or expired token');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    console.log('[AUTH] User authenticated:', decoded.userId);
    next();
  } catch (err) {
    console.error('[AUTH] Error:', err.message);
    res.status(500).json({ error: 'Authentication error', message: err.message });
  }
};

export const authenticateToken = authMiddleware;
export default authMiddleware;
