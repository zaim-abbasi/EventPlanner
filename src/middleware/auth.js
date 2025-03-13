import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'myyyyyyyyysecretttttttttkeyyyyyyyyyyyyy';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};