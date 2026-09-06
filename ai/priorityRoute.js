const express = require('express');
const router = express.Router();
const { getSemanticPriority } = require('./priorityEngine');

router.post('/priority', async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'content is required' });
    }

    const result = await getSemanticPriority(content);
    res.json(result);
});

module.exports = router;