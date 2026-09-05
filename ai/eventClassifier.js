const { callLLM } = require('./aiService');

const CLASSIFICATION_CATEGORIES = [
  'NAVIGATION',
  'CUSTOMER_UPDATE',
  'CUSTOMER_CALL',
  'OTP',
  'MANAGER_MESSAGE',
  'SAFETY_ALERT',
  'RIDER_REQUEST',
  'LOW_VALUE_MESSAGE',
];

const FALLBACK_RESULT = { category: 'LOW_VALUE_MESSAGE', confidence: 0 };

const SYSTEM_PROMPT = `You are an event classifier for a delivery-rider voice assistant.
Classify the given message into exactly one of these categories:
${CLASSIFICATION_CATEGORIES.join(', ')}

Category meanings:
- NAVIGATION: turn-by-turn directions, route or GPS instructions
- CUSTOMER_UPDATE: customer providing delivery/location info (e.g. "use gate 3")
- CUSTOMER_CALL: an incoming/missed call notification from the customer
- OTP: one-time passcodes or verification codes
- MANAGER_MESSAGE: messages from dispatch/fleet manager
- SAFETY_ALERT: warnings about hazards, accidents, weather, or rider safety
- RIDER_REQUEST: the rider asking the assistant to do something
- LOW_VALUE_MESSAGE: unclear, irrelevant, or not important

Respond with ONLY a raw JSON object, no markdown, no explanation, exactly:
{"category": "<ONE_OF_THE_CATEGORIES>", "confidence": <number 0 to 1>}`;

function extractJson(rawText) {
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function isValid(result) {
  return (
    result &&
    typeof result.category === 'string' &&
    CLASSIFICATION_CATEGORIES.includes(result.category) &&
    typeof result.confidence === 'number' &&
    result.confidence >= 0 &&
    result.confidence <= 1
  );
}

async function classifyEvent(content) {
  if (!content || typeof content !== 'string' || !content.trim()) {
    return { ...FALLBACK_RESULT, reasonCode: 'EMPTY_CONTENT' };
  }

  try {
    const raw = await callLLM(SYSTEM_PROMPT, content);
    const parsed = extractJson(raw);

    if (!isValid(parsed)) {
      console.warn('[classifier] invalid AI response, falling back:', raw);
      return { ...FALLBACK_RESULT, reasonCode: 'INVALID_AI_RESPONSE' };
    }

    return {
      category: parsed.category,
      confidence: parsed.confidence,
      reasonCode: 'AI_CLASSIFIED',
    };
  } catch (err) {
    console.error('[classifier] AI service error:', err.message);
    return { ...FALLBACK_RESULT, reasonCode: 'AI_SERVICE_ERROR' };
  }
}

module.exports = { classifyEvent, CLASSIFICATION_CATEGORIES };