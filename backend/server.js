require('dotenv').config();
const express = require('express');
const cors = require('cors');

const classifyRoute = require('../ai/classifyRoute');
const priorityRoute = require('../ai/priorityRoute');
const speechPlannerRoute = require('../ai/speechPlannerRoute');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', classifyRoute);
app.use('/api', priorityRoute);
app.use('/api', speechPlannerRoute);

app.use((err, req, res, next) => {
  console.error('[server] unhandled error:', err);
  res.status(500).json({ error: 'internal server error' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});