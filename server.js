const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/download', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        const apiUrl = `https://pragyaninstagr.vercel.app/?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status !== 'success' || !data.data.videoUrl) {
            return res.status(400).json({ error: 'Failed to get video URL' });
        }

        // Fetch the actual video content
        const videoResponse = await fetch(data.data.videoUrl);
        const videoBuffer = await videoResponse.buffer();

        // Set appropriate headers
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename=${data.data.filename}`);
        
        // Send the video buffer
        res.send(videoBuffer);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;