const express = require('express');
const router = express.Router();
const { detectIntent } = require('./intentDetector');

router.post('/intent', async (req, res) => {
    const { transcript } = req.body;

    if (!transcript) {
        return res.status(400).json({ error: 'transcript is required' });
    }

    const result = await detectIntent(transcript);
    res.json(result);
});

module.exports = router;