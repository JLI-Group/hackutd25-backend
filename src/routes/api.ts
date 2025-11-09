import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import config from '../config/index.js'
import { OpenAI } from 'openai'

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

        // Here you can add your image processing logic
        // For example:
        // - Resize the image
        // - Extract metadata
        // - Save info to database
        // - Process with AI/ML models

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
                            text: 'Describe the car in the image. I need the body style (e.g.Sedan, SUV, Truck, Mini-van), car use (e.g. Daily commuting, Off-road, Work, Leisure), and color.',
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

export default router
