import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import config from '../config/index.js'
import { OpenAI } from 'openai'
import { createRequire } from 'module'
import Car from '../models/car.js'
import apr from '../models/apr.js'

// const require = createRequire(import.meta.url)

// Use require for pdf-parse as it has CommonJS structure
// async function parsePdf(buffer: Buffer) {
//   const pdfParse = require('pdf-parse')
//   return await pdfParse(buffer)
// }

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

// PDF file filter for document verification
const pdfFileFilter = (
  req: express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only PDF documents are allowed.'))
  }
}

// Configure multer for PDF uploads
const uploadPdf = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for PDFs
  },
  fileFilter: pdfFileFilter,
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
  console.log('Received file upload request')
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

    // Here you can add your image processing logic
    // For example:
    // - Resize the image
    // - Extract metadata
    // - Save info to database
    // - Process with AI/ML models

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe the car in the image based on the keywords of this schema: ["Sedan", "SUV", "Truck", "Mini-van"], ["Daily commuting", "Off-road", "Work", "Leisure"], ["Smooth & comfortable", "Sporty & responsive", "Off-road capable"], ["Gasoline", "Hybrid", "Electric"], ["2", "4", "5", "7+"]. Pick a key word for each array that best describes the car and separate it by commas.',
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
    console.log('OpenAI response:', response)

    const aiContent = response.choices[0]?.message?.content
    if (!aiContent) {
      console.error('No content in OpenAI response')
      return res.status(500).json({
        success: false,
        message: 'Failed to analyze image - no AI response content',
        aiResponse: response,
      })
    }

    var carInfo = aiContent.split(',') || ['', '', '', '', '']
    console.log('AI response car info:', carInfo)

    // Validate AI response
    if (!carInfo || carInfo.length < 5) {
      console.error('Invalid AI response format:', aiContent)
      return res.status(500).json({
        success: false,
        message:
          'Invalid AI response format - expected 5 comma-separated values',
        aiResponse: aiContent,
      })
    }

    var seats = carInfo[4] ? parseInt(carInfo[4].trim().replace('+', '')) : 0
    var bodyStyle = carInfo[0] ? carInfo[0].trim() : ''
    var usage = carInfo[1] ? carInfo[1].trim() : ''
    var drivingExperience = carInfo[2] ? carInfo[2].trim() : ''
    var engineType = carInfo[3] ? carInfo[3].trim() : ''

    console.log('Parsed car data:', {
      bodyStyle,
      usage,
      drivingExperience,
      engineType,
      seats,
    })

    console.log('Parsed car data:', {
      bodyStyle,
      usage,
      drivingExperience,
      engineType,
      seats,
    })

    // Delete the file after processing
    fs.unlink(fileInfo.path, (err) => {
      if (err) {
        console.error('Error deleting uploaded file:', err)
      }
    })

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
            ...(bodyStyle
              ? [
                  {
                    text: {
                      query: bodyStyle,
                      path: 'bodyStyle',
                      score: { boost: { value: 2.0 } },
                    },
                  },
                ]
              : []),
            ...(usage.length > 0
              ? [
                  {
                    text: {
                      query: usage,
                      path: 'usage',
                      score: { boost: { value: 0.8 } },
                    },
                  },
                ]
              : []),
            ...(drivingExperience.length > 0
              ? [
                  {
                    text: {
                      query: drivingExperience,
                      path: 'drivingExperience',
                      score: { boost: { value: 0.8 } },
                    },
                  },
                ]
              : []),
            ...(engineType.length > 0
              ? [
                  {
                    text: {
                      query: engineType,
                      path: 'engineType',
                      score: { boost: { value: 1.5 } },
                    },
                  },
                ]
              : []),
          ],
        },
      },
    }

    console.log('Search query:', JSON.stringify(searchQuery, null, 2))

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
      {
        $limit: 1,
      },
    ])

    console.log('Matched cars:', matchedCars)

    return res.json({
      success: true,
      matches: matchedCars,
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
  let loanOptions = loanTerms.map((n, index) => {
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

  // Recommend the best option based on inputs and llm response
  const prompt = `Given a FICO score of ${ficoScore}, a monthly income of $${monthlyIncome}, and a car price of $${carPrice}, which loan term would you recommend from the following options (only pick 1): ${loanOptions
    .map(
      (option) =>
        `${option.term} months - $${option.monthlyPayment} - ${
          option.apr * 100
        }%`
    )
    .join(', ')}? Provide only the term in months as a number.`
  const aiResponse = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })
  const recommendText = aiResponse.choices[0]?.message?.content || ''
  const recommendMatch = recommendText.match(/(\d{2})/)
  let recommend = null
  if (recommendMatch && recommendMatch[1]) {
    recommend = parseInt(recommendMatch[1], 10)
  }
  loanOptions = loanOptions.map((option) => ({
    ...option,
    recommended: option.term === recommend,
  }))
  console.log(`AI recommended ${recommendText}`)

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
            ...(bodyStyle
              ? [
                  {
                    text: {
                      query: bodyStyle,
                      path: 'bodyStyle',
                      score: { boost: { value: 2.0 } },
                    },
                  },
                ]
              : []),
            ...(usage.length > 0
              ? [
                  {
                    text: {
                      query: usage,
                      path: 'usage',
                      score: { boost: { value: 1.5 } },
                    },
                  },
                ]
              : []),
            ...(drivingExperience.length > 0
              ? [
                  {
                    text: {
                      query: drivingExperience,
                      path: 'drivingExperience',
                      score: { boost: { value: 0.8 } },
                    },
                  },
                ]
              : []),
            ...(engineType.length > 0
              ? [
                  {
                    text: {
                      query: engineType,
                      path: 'engineType',
                      score: { boost: { value: 1.5 } },
                    },
                  },
                ]
              : []),
            ...(driveType.length > 0
              ? [
                  {
                    text: {
                      query: driveType,
                      path: 'driveType',
                      score: { boost: { value: 0.8 } },
                    },
                  },
                ]
              : []),
            ...(priority.length > 0
              ? [
                  {
                    text: {
                      query: priority,
                      path: 'priority',
                      score: { boost: { value: 1.5 } },
                    },
                  },
                ]
              : []),
          ],
        },
      },
    }

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
        $sort: { searchScore: -1, price: -1 }, // sort by best match
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

router.post('/lease-details', async (req, res) => {
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
  const leaseFee = 1000 // Flat lease fee for simplicity
  const capCost = carPrice - downPayment + leaseFee
  const termMonths = [24, 36, 48, 60, 72]
  const aprPremium = [0, 0.0025, 0.003, 0.005, 0.0075]

  // Adjust APR based on LTV
  let finalApr = baseApr + 0.05 * (ltv - 0.8) // Usually highest/standard is 20% down payment, 0.05 is arbitrary (fees, risk, etc)

  // Adjusted APRs where premium is added on the last term's APR
  const adjustedAprs: number[] = []
  let lastApr = finalApr
  for (let i = 0; i < termMonths.length; i++) {
    if (aprPremium[i] == undefined) {
      throw new Error('Index out of bounds for aprPremium array: ' + i)
    }
    lastApr += aprPremium[i]!
    adjustedAprs.push(lastApr)
  }
  const moneyFactors = adjustedAprs.map((apr) => (apr / 2400) * 100) // Simplified money factor conversion
  const residuals = [0.68, 0.61, 0.53, 0.45, 0.38] // Residual value percentages for 24,36,48,60,72 months
  const residualValues = residuals.map((r) => carPrice * r)
  const deprecation = residualValues.map((rv, i) => {
    if (!termMonths[i] || !residualValues[i] || !moneyFactors[i]) {
      throw new Error('Index out of bounds for termMonths array: ' + i)
    }
    return (capCost - rv) / termMonths[i]
  })
  const financeCharges = termMonths.map((n, i) => {
    if (!termMonths[i]) {
      throw new Error('Index out of bounds for termMonths array: ' + i)
    }
    return (capCost + residualValues[i]!) * moneyFactors[i]!
  })
  const monthlyPayments = deprecation.map((dep, i) => {
    if (!termMonths[i]) {
      throw new Error('Index out of bounds for termMonths array: ' + i)
    }
    return dep + financeCharges[i]!
  })

  const leaseOptions = termMonths.map((n, i) => {
    return {
      term: n,
      apr: parseFloat(adjustedAprs[i]!.toFixed(4)),
      monthlyPayment: parseFloat(monthlyPayments[i]!.toFixed(2)),
    }
  })

  console.log(leaseOptions)
  // Recommend the best option based on inputs and llm response
  const prompt = `Given a FICO score of ${ficoScore}, a monthly income of $${monthlyIncome}, and a car price of $${carPrice}, which lease term would you recommend from the following options: ${leaseOptions
    .map(
      (option) =>
        `${option.term} months - $${option.monthlyPayment} - ${
          option.apr * 100
        }%`
    )
    .join(', ')}? Provide only the term in months as a number.`
  console.log('Lease recommendation prompt:', prompt)
  const aiResponse = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })
  const recommendText = aiResponse.choices[0]?.message?.content || ''
  const recommendMatch = recommendText.match(/(\d{2})/)
  let recommend = null
  if (recommendMatch && recommendMatch[1]) {
    recommend = parseInt(recommendMatch[1], 10)
  }
  console.log(`AI recommended for lease ${recommendText}`)

  return res.json({
    success: true,
    message: 'Lease details calculated successfully',
    data: {
      leaseOptions: leaseOptions.map((option) => ({
        term: option.term,
        apr: option.apr,
        monthlyPayment: option.monthlyPayment,
        recommended: option.term === recommend,
      })),
    },
  })
})

/**
 * Endpoint to verify document uploads against user finance information
 * Given: PDF document + user finance info (ficoScore, monthlyIncome, carPrice)
 * Returns: Verification result indicating if the document matches the provided information
 */
router.post(
  '/verify-documents',
  uploadPdf.single('document'),
  async (req, res) => {
    console.log('Received document verification request')

    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No document file provided',
        })
      }

      // Parse the user finance information from request body
      const { ficoScore, monthlyIncome, carPrice, ssn } = req.body

      if (!ficoScore || !monthlyIncome) {
        return res.status(400).json({
          success: false,
          message:
            'Missing required finance information (ficoScore, monthlyIncome)',
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

      console.log('Document uploaded:', fileInfo)
      console.log('User finance info:', {
        ficoScore,
        monthlyIncome,
        carPrice,
        ssn,
      })

      // Extract text from PDF
      // const pdfBuffer = fs.readFileSync(fileInfo.path)
      // const pdfData = await parsePdf(pdfBuffer)
      // const documentText = pdfData.text

      // console.log('Extracted PDF text (first 500 chars):', documentText.substring(0, 500))

      // Use GPT-4o to verify the document against user finance information
      const verificationPrompt = `
You are a document verification specialist. I will provide you with:
1. Text extracted from a financial document (PDF)
2. User-provided finance information

Please analyze the document and verify if the information matches:
- Monthly Income: ${monthlyIncome}
- FICO/Credit Score: ${ficoScore}
${ssn ? `- SSN (last 4 digits): ${ssn}` : ''}
${carPrice ? `- Car Price/Loan Amount: ${carPrice}` : ''} (it doesn't have to match exactly but within 20% range)

Please respond with a JSON object containing:
{
  "verified": boolean,
  "confidence": number (0-100),
  "matchingFields": array of strings (which fields matched),
  "discrepancies": array of strings (any discrepancies found),
  "documentType": string (what type of document this appears to be),
  "summary": string (brief explanation of verification result)
}

Focus on finding exact or approximate matches for the provided values. Be strict but reasonable with verification. A match in any of the fields increases confidence, but a match in SSN increases confidence significantly. If no fields match, verified should be false with low confidence.
`

      const file = await openai.files.create({
        file: fs.createReadStream(fileInfo.path),
        purpose: 'user_data',
      })

      const aiResponse = await openai.responses.create({
        model: 'gpt-5',
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: verificationPrompt },
              {
                type: 'input_file',
                file_id: file.id
              },
            ],
          },
        ],
      })

      console.log('AI verification response:', aiResponse)

      const verificationResult = aiResponse.output_text
      if (!verificationResult) {
        throw new Error('No verification result from AI')
      }

      let parsedResult
      try {
        parsedResult = JSON.parse(verificationResult)
      } catch (parseError) {
        console.error('Failed to parse AI response:', verificationResult)
        throw new Error('Invalid AI response format')
      }

      console.log('Document verification result:', parsedResult)

      // Delete the uploaded file after processing for security
      fs.unlink(fileInfo.path, (err) => {
        if (err) {
          console.error('Error deleting uploaded file:', err)
        } else {
          console.log('Uploaded file deleted successfully')
        }
      })

      return res.json({
        success: true,
        message: 'Document verification completed',
        data: {
          verification: parsedResult,
          fileInfo: {
            originalName: fileInfo.originalName,
            size: fileInfo.size,
            uploadedAt: new Date().toISOString(),
          },
        },
      })
    } catch (error) {
      console.error('Error verifying document:', error)

      // Clean up uploaded file in case of error
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file after error:', err)
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Error verifying document',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
)

export default router
