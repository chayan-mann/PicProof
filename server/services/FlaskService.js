const axios = require('axios');
const FormData = require('form-data');
const dotenv = require("dotenv");

dotenv.config();
const FLASK_URL = process.env.FLASK_URL;

async function callFlaskAPI(fileBuffer, originalName, mimeType) {
  try {
    if (!fileBuffer) {
      return { error: 'No file buffer provided' };
    }

    const form = new FormData();
    form.append('file', fileBuffer, { filename: originalName || 'image.jpg', contentType: mimeType || 'application/octet-stream' });

    const flaskResp = await axios.post(`${FLASK_URL}/predict`, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 20000
    });

    return flaskResp.data;
  } catch (err) {
    // Multer size limit error
    if (err && err.code === 'LIMIT_FILE_SIZE') {
      return { error: 'File too large', details: 'Max upload size is 25MB' };
    }
    if (err.response) {
      return { error: 'Flask error', details: err.response.data };
    }
    console.error('Predict proxy error:', err.message);
    return { error: 'Server error', details: err.message };
  }
}

exports.callFlaskAPI = callFlaskAPI;