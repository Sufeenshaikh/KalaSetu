import aiModel from '../models/ai.model.js';

// Simple middleware that checks per-user daily quota before allowing AI generation
export default function rateLimit({ limitPerDay = 5 } = {}) {
  return async (req, res, next) => {
    try {
      const userId = req.user && req.user.uid;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { allowed, remaining } = await aiModel.incrementUsage(userId, limitPerDay);
      if (!allowed) {
        return res.status(429).json({ success: false, error: 'AI usage limit reached for today' });
      }

      // attach remaining to request for logging/debugging
      req.aiUsage = { remaining };
      next();
    } catch (err) {
      console.error('RateLimit error:', err);
      // allow in case of backend error to avoid blocking critical flows
      next();
    }
  };
}
