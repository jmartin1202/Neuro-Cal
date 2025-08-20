import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const checkFeatureAccess = (feature) => {
  return async (req, res, next) => {
    try {
      // Import SubscriptionService dynamically to avoid circular dependencies
      const { default: SubscriptionService } = await import('../services/subscriptionService.js');
      
      const hasAccess = await SubscriptionService.hasFeatureAccess(req.user.id, feature);
      
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Feature not available in your current plan',
          upgrade_required: true,
          feature: feature
        });
      }
      
      // Track usage
      await SubscriptionService.trackUsage(req.user.id, feature);
      next();
    } catch (error) {
      console.error('Failed to check feature access:', error);
      res.status(500).json({ error: 'Failed to check feature access' });
    }
  };
};

export const requireSubscription = (minStatus = 'trial') => {
  return async (req, res, next) => {
    try {
      const { default: SubscriptionService } = await import('../services/subscriptionService.js');
      
      const subscription = await SubscriptionService.getUserSubscription(req.user.id);
      
      if (!subscription) {
        return res.status(403).json({ 
          error: 'Active subscription required',
          upgrade_required: true
        });
      }
      
      const validStatuses = ['trial', 'active'];
      if (minStatus === 'active' && !validStatuses.includes(subscription.status)) {
        return res.status(403).json({ 
          error: 'Active subscription required',
          upgrade_required: true
        });
      }
      
      req.subscription = subscription;
      next();
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      res.status(500).json({ error: 'Failed to check subscription status' });
    }
  };
};
