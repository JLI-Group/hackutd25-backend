import 'dotenv/config';

interface Config {
  server: {
    port: number;
    nodeEnv: string;
  };
  database: {
    mongoConnection: string;
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    mongoConnection: process.env.MONGO_CONNECTION || '',
  },
};

// Validate required environment variables
const validateConfig = () => {
  const requiredVars = [
    'MONGO_CONNECTION',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0 && config.server.nodeEnv === 'production') {
    console.error('Missing required environment variables:', missingVars);
    process.exit(1);
  }

  if (missingVars.length > 0) {
    console.warn('Warning: Missing environment variables (using defaults):', missingVars);
  }
};

validateConfig();

export default config;