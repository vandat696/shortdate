import { verifyToken } from '../config/auth-helpers.js';

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer token"
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Authentication error', message: err.message });
  }
};

export default authMiddleware;
