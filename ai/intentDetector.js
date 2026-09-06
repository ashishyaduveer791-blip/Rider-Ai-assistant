const { callLLM } = require('./aiService');

const INTENTS = [
    'STOP',
    'REPEAT',
    'PAUSE',
    'CONTINUE',
    'CALL_CUSTOMER',
    'READ_INSTRUCTIONS',
    'MARK_DELIVERED',
    'NEXT_DELIVERY',
    'UNKNOWN',
];

const FALLBACK_RESULT = { intent: 'UNKNOWN', confidence: 0 };

const SYSTEM_PROMPT = `You are an intent detector for a delivery-rider voice assistant.
The rider speaks a command (possibly in English, Hindi, or Hinglish),
and it has been transcribed by speech-to-text. Map the transcript to
EXACTLY ONE of these intents:
${INTENTS.join(', ')}

Intent meanings:
- STOP: rider wants the assistant to stop talking/doing something now (e.g. "stop", "ruk jao", "chup")
- REPEAT: rider wants the last message repeated (e.g. "say that again", "phir se bolo")
- PAUSE: rider wants to pause, not stop entirely (e.g. "wait a sec", "thoda ruko")
- CONTINUE: rider wants to resume after a pause (e.g. "go on", "chalu karo", "continue")
- CALL_CUSTOMER: rider wants to call the customer (e.g. "call the customer", "customer ko call karo")
- READ_INSTRUCTIONS: rider wants delivery instructions read out (e.g. "read the address", "instructions batao")
- MARK_DELIVERED: rider confirms a delivery is complete (e.g. "delivered", "ho gaya", "package diya")
- NEXT_DELIVERY: rider wants to move to the next delivery (e.g. "next one", "agla delivery")
- UNKNOWN: transcript doesn't clearly match any of the above

Respond with ONLY a raw JSON object, no markdown, no extra text, exactly:
{"intent": "<ONE_OF_THE_INTENTS>", "confidence": <number 0 to 1>}`;

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
        typeof result.intent === 'string' &&
        INTENTS.includes(result.intent) &&
        typeof result.confidence === 'number' &&
        result.confidence >= 0 &&
        result.confidence <= 1
    );
}

async function detectIntent(transcript) {
    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
        return { ...FALLBACK_RESULT, source: 'FALLBACK_EMPTY_TRANSCRIPT' };
    }

    try {
        const raw = await callLLM(SYSTEM_PROMPT, transcript, { timeoutMs: 20000 });
        const parsed = extractJson(raw);

        if (!isValid(parsed)) {
            console.warn('[intentDetector] invalid AI response, falling back:', raw);
            return { ...FALLBACK_RESULT, source: 'FALLBACK_INVALID_AI_RESPONSE' };
        }

        return {
            intent: parsed.intent,
            confidence: parsed.confidence,
            source: 'AI_DETECTED',
        };
    } catch (err) {
        console.error('[intentDetector] AI service error:', err.message);
        return { ...FALLBACK_RESULT, source: 'FALLBACK_AI_SERVICE_ERROR' };
    }
}

module.exports = { detectIntent, INTENTS };