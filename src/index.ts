import 'dotenv/config';
import express from 'express';
import config from './config/index.js';
import apiRoutes from './routes/api.js';
import { connectDB } from './config/database.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello, Express with TypeScript and ES Modules!' });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
    port: config.server.port
  });
});

// API routes
app.use('/api', apiRoutes);

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(config.server.port, () => {
    console.log(`Server running on port ${config.server.port} in ${config.server.nodeEnv} mode`);
    console.log(`Environment variables loaded: ${Object.keys(process.env).filter(key => !key.startsWith('npm_')).length} variables`);
  });
});

export default app;