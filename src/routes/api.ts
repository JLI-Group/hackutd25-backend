import express from 'express';
import config from '../config/index.js';

const router = express.Router();

// Example API routes
router.get('/users', (req, res) => {
  res.json({ 
    users: [],
    environment: config.server.nodeEnv,
    message: 'Users retrieved successfully'
  });
});

router.post('/users', (req, res) => {
  const { name, email } = req.body;
  res.json({ 
    message: 'User created successfully',
    user: { id: 1, name, email },
    environment: config.server.nodeEnv
  });
});

// Configuration endpoint (development only)
router.get('/config', (req, res) => {
  if (config.server.nodeEnv !== 'development') {
    return res.status(403).json({ message: 'Config endpoint only available in development' });
  }
  
  return res.json({
    server: {
      port: config.server.port,
      nodeEnv: config.server.nodeEnv
    },
    database: {
      hasConnection: !!config.database.mongoConnection
    },
  });
});

export default router;