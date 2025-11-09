import 'dotenv/config'
import express from 'express'
import multer from 'multer'
import cors from 'cors'
import config from './config/index.js'
import apiRoutes from './routes/api.js'
import { connectDB } from './config/database.js'

const app = express()

// CORS configuration
const corsOptions = {
  origin: '*', // In production, replace with your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files (for testing)
app.use(express.static('public'))
app.use('/test', express.static('.'))

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello, Express with TypeScript and ES Modules!' })
})

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
    port: config.server.port,
  })
})

// API routes
app.use('/api', apiRoutes)

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(config.server.port, () => {
    console.log(
      `Server running on port ${config.server.port} in ${config.server.nodeEnv} mode`
    )
    console.log(
      `Environment variables loaded: ${
        Object.keys(process.env).filter((key) => !key.startsWith('npm_')).length
      } variables`
    )
  })
})
// Error handling middleware for multer
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB.',
        })
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field. Expected field name: "image"',
        })
      }
    }

    if (
      error.message ===
      'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    // Default error response
    console.error('Unhandled error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
)

export default app
