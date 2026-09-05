const express = require('express');
const router = express.Router();
const { classifyEvent } = require('./eventClassifier');

router.post('/classify', async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'content is required' });
    }

    const result = await classifyEvent(content);
    res.json(result);
});

module.exports = router;