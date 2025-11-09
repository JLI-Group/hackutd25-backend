import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import config from '../config/index.js'
import { OpenAI } from 'openai'
import Car from '../models/car.js'
import apr from '../models/apr.js'

interface ICar {
  name: string
  bodyStyle: string
  usage: string[]
  drivingExperience: string[]
  engineType: string[]
  seats: number
  driveType: string[]
  trimLevels: string[]
  priority: string[]
}

const openai = new OpenAI()

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads')
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  },
})

// File filter to only allow specific image types
const fileFilter = (
  req: express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      )
    )
  }
}

// Configure multer with size limits and file filtering
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
})

const router = express.Router()

// Example API routes
router.get('/users', (req, res) => {
  res.json({
    users: [],
    environment: config.server.nodeEnv,
    message: 'Users retrieved successfully',
  })
})

router.post('/users', (req, res) => {
  const { name, email } = req.body
  res.json({
    message: 'User created successfully',
    user: { id: 1, name, email },
    environment: config.server.nodeEnv,
  })
})

router.post('/car-upload', upload.single('image'), async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file uploaded',
            })
        }

        // File information
        const fileInfo = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
        }

        console.log('File uploaded:', fileInfo)


        const response = await openai.chat.completions.create({
            model: 'gpt-4-vision-preview',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: "Describe the car in the image based on the keywords of this schema: [\"Sedan\", \"SUV\", \"Truck\", \"Mini-van\"], [\"Daily commuting\", \"Off-road\", \"Work\", \"Leisure\"], [\"Smooth & comfortable\", \"Sporty & responsive\", \"Off-road capable\"], [\"Gasoline\", \"Hybrid\", \"Electric\"], [\"AWD\", \"RWD\", \"FWD\"], [\"Base\", \"Sport\", \"EX\", \"Luxury\"]. Pick a key word for each array that best describes the car and separate it by commas.",
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${fileInfo.mimetype};base64,${fs.readFileSync(fileInfo.path, 'base64')}`,
                                detail: 'high'
                            }
                        },
                    ],
                },
            ],
        })

        // Delete the file after processing
        fs.unlink(fileInfo.path, (err) => {
            if (err) {
                console.error('Error deleting uploaded file:', err)
            }
        })

        return res.json({
            success: true,
            message: 'Car image uploaded successfully',
            file: {
                filename: fileInfo.filename,
                originalName: fileInfo.originalName,
                size: fileInfo.size,
                mimetype: fileInfo.mimetype,
            },
            modelResponse: response.choices[0]?.message?.content || 'No response',
        })
    } catch (error) {
        console.error('Error uploading file:', error)
        // Deleting the uploaded file in case of error
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error('Error deleting uploaded file:', err)
                }
            })
        }
        return res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error instanceof Error ? error.message : 'Unknown error',
        })
    }

    // File information
    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    }

    console.log('File uploaded:', fileInfo)

    // Here you can add your image processing logic
    // For example:
    // - Resize the image
    // - Extract metadata
    // - Save info to database
    // - Process with AI/ML models

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe the car in the image based on the keywords of this schema: ["Sedan", "SUV", "Truck", "Mini-van"], ["Daily commuting", "Off-road", "Work", "Leisure"], ["Smooth & comfortable", "Sporty & responsive", "Off-road capable"], ["Gasoline", "Hybrid", "Electric"], ["AWD", "RWD", "FWD"], ["Base", "Sport", "EX", "Luxury"]. Pick a key word for each array that best describes the car and separate it by commas.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${fileInfo.mimetype};base64,${fs.readFileSync(
                  fileInfo.path,
                  'base64'
                )}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
    })

    // Delete the file after processing
    fs.unlink(fileInfo.path, (err) => {
      if (err) {
        console.error('Error deleting uploaded file:', err)
      }
    })

    return res.json({
      success: true,
      message: 'Car image uploaded successfully',
      file: {
        filename: fileInfo.filename,
        originalName: fileInfo.originalName,
        size: fileInfo.size,
        mimetype: fileInfo.mimetype,
      },
      modelResponse: response.choices[0]?.message?.content || 'No response',
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    // Deleting the uploaded file in case of error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('Error deleting uploaded file:', err)
        }
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

/**
 * Endpoint to get loan details
 * Given: FICO, Monthly Income, Car Price
 * Returns: Suggested loan terms including APR and monthly payment
 */
router.post('/loan-details', async (req, res) => {
  const { ficoScore, monthlyIncome, carPrice } = req.body

  // Get APR based on FICO score from database
  let customerTier: string
  if (ficoScore >= 781) {
    customerTier = 'SuperPrime'
  } else if (ficoScore >= 661 && ficoScore <= 780) {
    customerTier = 'Prime'
  } else if (ficoScore >= 601 && ficoScore <= 660) {
    customerTier = 'Non-Prime'
  } else if (ficoScore >= 501 && ficoScore <= 600) {
    customerTier = 'SubPrime'
  } else {
    customerTier = 'Deep-SubPrime'
  }

  const baseApr = await apr
    .findOne({ tier: customerTier })
    .then((doc) => (doc ? doc.rate : null))

  if (!baseApr) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving APR from database',
    })
  }

  const carPriceCap = carPrice * 0.1 // 10% is arbitrary
  const monthlyIncomeCap = monthlyIncome * 12 * 0.05 // 5% of annual income (arbitrary)
  const downPayment = Math.min(carPriceCap, monthlyIncomeCap)
  const ltv = (carPrice - downPayment) / carPrice

  // Adjust APR based on LTV
  let finalApr = baseApr + 0.05 * (ltv - 0.8) // Usually highest/standard is 20% down payment, 0.05 is arbitrary (fees, risk, etc)

  // Calculate monthly payment using standard formula for 24, 36, 48, 60, 72 month terms
  const loanTerms = [24, 36, 48, 60, 72]
  const paymentFees = [1.025, 1.05, 1.075, 1.125, 1.15]
  const aprPremium = [0, 0.0025, 0.003, 0.005, 0.0075]

  let lastApr = finalApr
  const loanOptions = loanTerms.map((n, index) => {
    if (aprPremium[index] == undefined || paymentFees[index] == undefined) {
      throw new Error(
        'Index out of bounds for aprPremium or paymentFees arrays: ' + index
      )
    }
    // Add the APR premium to get the current term's APR
    const currentApr = lastApr + aprPremium[index]
    console.log(`Current APR for term ${n}: ${currentApr}`)
    const r = currentApr / 12
    const pv = carPrice - downPayment
    console.log(`r = ${r} for term ${n} months`)
    const monthlyPayment =
      ((pv * r) / (1 - Math.pow(1 + r, -n))) * paymentFees[index]
    // Update lastApr for the next iteration
    lastApr = currentApr
    return {
      term: n,
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      apr: parseFloat(currentApr.toFixed(4)),
    }
  })

  return res.json({
    success: true,
    message: 'Loan details calculated successfully',
    data: {
      loanOptions: loanOptions,
    },
  })
})

// Configuration endpoint (development only)
router.get('/config', (req, res) => {
  if (config.server.nodeEnv !== 'development') {
    return res
      .status(403)
      .json({ message: 'Config endpoint only available in development' })
  }

  return res.json({
    server: {
      port: config.server.port,
      nodeEnv: config.server.nodeEnv,
    },
    database: {
      hasConnection: !!config.database.mongoConnection,
    },
  })
})


// Car matching endpoint using MongoDB Atlas Search
router.post('/cars/match', async (req, res) => {
  try {
    const {
      usage = [],
      drivingExperience = [],
      engineType = [],
      seats = 0,
      bodyStyle = '',
      driveType = [],
      priority = [],
    } = req.body

    console.log('Search criteria:', {
      usage,
      drivingExperience,
      engineType,
      seats,
      bodyStyle,
      driveType,
      priority,
    })

    // Build Atlas Search query
    const searchQuery = {
      $search: {
        index: 'default',
        compound: {
          must: [
            ...(seats > 0
              ? [
                  {
                    range: {
                      path: 'seats',
                      gte: seats,
                    },
                  },
                ]
              : []),
          ],
          should: [
            ...(bodyStyle ? [{
              text: {
                query: bodyStyle,
                path: "bodyStyle",
                score: { boost: { value: 2.0 } }
              }
            }] : []),
            ...(usage.length > 0 ? [{
              text: {
                query: usage,
                path: "usage",
                score: { boost: { value: 0.8 } }
              }
            }] : []),
            ...(drivingExperience.length > 0 ? [{
              text: {
                query: drivingExperience,
                path: "drivingExperience",
                score: { boost: { value: 0.8 } }
              }
            }] : []),
            ...(engineType.length > 0 ? [{
              text: {
                query: engineType,
                path: "engineType",
                score: { boost: { value: 1.5 } }
              }
            }] : []),
            ...(driveType.length > 0 ? [{
              text: {
                query: driveType,
                path: "driveType",
                score: { boost: { value: 0.8 } }
              }
            }] : []),
            ...(priority.length > 0 ? [{
              text: {
                query: priority,
                path: "priority",
                score: { boost: { value: 1.5 } }
              }
            }] : [])
          ]
        }
      }
    };

    // Execute the search query
    const matchedCars = await Car.aggregate([
      searchQuery,
      {
        $addFields: {
          searchScore: { $meta: 'searchScore' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          bodyStyle: 1,
          usage: 1,
          drivingExperience: 1,
          engineType: 1,
          seats: 1,
          driveType: 1,
          priority: 1,
          price: 1,
          description: 1,
          searchScore: 1,
        },
      },
      {
        $sort: { searchScore: -1 }, // sort by best match
      },
    ])

    return res.json({
      success: true,
      matches: matchedCars,
    })
  } catch (error) {
    console.error('Atlas Search error:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
})

export default router
