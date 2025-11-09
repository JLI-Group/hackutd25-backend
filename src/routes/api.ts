import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import config from '../config/index.js'
import { OpenAI } from 'openai'
import Car from '../models/car.js';

interface ICar {
  name: string;
  bodyStyle: string;
  usage: string[];
  drivingExperience: string[];
  engineType: string[];
  seats: number;
  driveType: string[];
  trimLevels: string[];
  priority: string[];
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


        const fileContent = fs.createReadStream(fileInfo.path)
        const fileId = await openai.files
            .create({
                file: fileContent,
                purpose: 'vision',
            })
            .then((file) => file.id)

        const response = await openai.responses.create({
            model: 'gpt-4.1-mini',
            input: [
            {
                role: 'user',
                content: [
                {
                    type: 'input_text',
                    text: "Describe the car in the image based on the keywords of this schema: [\"Sedan\", \"SUV\", \"Truck\", \"Mini-van\"], [\"Daily commuting\", \"Off-road\", \"Work\", \"Leisure\"], [\"Smooth & comfortable\", \"Sporty & responsive\", \"Off-road capable\"], [\"Gasoline\", \"Hybrid\", \"Electric\"], [\"AWD\", \"RWD\", \"FWD\"], [\"Base\", \"Sport\", \"EX\", \"Luxury\"]. Pick a key word for each array that best describes the car and separate it by commas.",
                },
                {
                    type: 'input_image',
                    file_id: fileId,
                    detail: 'high',
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
            modelResponse: response.output_text,
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
}) // Configuration endpoint (development only)
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
      priority = []
    } = req.body;

    console.log('Search criteria:', { usage, drivingExperience, engineType, seats, bodyStyle, driveType, priority });

    // Build Atlas Search query
    const searchQuery = {
      $search: {
        index: 'default',
        compound: {
          must: [
            ...(seats > 0 ? [{
              range: {
                path: "seats",
                gte: seats
              }
            }] : [])
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
          searchScore: { $meta: "searchScore" }
        }
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
          searchScore: 1    
        }
      },
      {
        $sort: { searchScore: -1 } // sort by best match
      },
    ]);

    return res.json({
      success: true,
      matches: matchedCars
    });

  } catch (error) {
    console.error('Atlas Search error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});


export default router
