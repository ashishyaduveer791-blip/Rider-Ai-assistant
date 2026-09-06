const express = require('express');
const router = express.Router();
const { planSpeech } = require('./speechPlanner');

router.post('/speech-plan', async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'content is required' });
    }

    const result = await planSpeech(content);
    res.json(result);
});

module.exports = router;