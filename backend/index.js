import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Multer configuration for handling image uploads
const upload = multer({ storage: multer.memoryStorage() });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.get('/', (req, res) => {
  res.json({ message: 'hello world' });
});

// POST route to process image uploads
app.post('/process-image', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Convert image to Base64
    const imageBase64 = req.file.buffer.toString('base64');

    // Send image to Gemini API
    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: req.file.mimetype,
        },
      },
      'Caption this image.',
    ]);

    const textResponse = result.response.text();

    // Log the response to console
    console.log('Caption Generated:', textResponse);

    // Return the response as JSON
    res.json({ caption: textResponse });
  } catch (error) {
    console.error(`Error processing this image: ${error}`);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
