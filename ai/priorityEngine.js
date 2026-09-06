const { callLLM } = require('./aiService');

const REASON_CODES = [
    'NAVIGATION_CRITICAL',
    'CUSTOMER_UPDATE',
    'DELIVERY_INSTRUCTION_CHANGE',
    'SAFETY_ALERT',
    'OTP_REQUIRED',
    'USER_REQUEST',
    'LOW_VALUE_MESSAGE',
];

const FALLBACK_RESULT = { priority: 10, reasonCode: 'LOW_VALUE_MESSAGE' };

const SYSTEM_PROMPT = `You are a semantic priority engine for a delivery-rider voice assistant.
Given a message, decide how urgent/important it is to the rider RIGHT NOW,
based on its meaning and context — not just its category.

Return a priority score from 0 to 100 (higher = more urgent) and exactly
one reasonCode from this list:
${REASON_CODES.join(', ')}

Reason code guide:
- NAVIGATION_CRITICAL: an urgent driving/route instruction (e.g. imminent turn, wrong-way warning)
- CUSTOMER_UPDATE: customer sharing new info that doesn't require an instant reaction
- DELIVERY_INSTRUCTION_CHANGE: a change to delivery details (gate, address, drop point) that affects the current delivery
- SAFETY_ALERT: hazards, accidents, or anything risking rider safety — always high priority
- OTP_REQUIRED: a one-time passcode needed to complete the delivery
- USER_REQUEST: the rider explicitly asking the assistant to do something
- LOW_VALUE_MESSAGE: irrelevant, unclear, or non-urgent chatter

Do not explain your reasoning. Respond with ONLY a raw JSON object, no
markdown, no extra text, exactly in this shape:
{"priority": <integer 0-100>, "reasonCode": "<ONE_OF_THE_REASON_CODES>"}`;

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
        typeof result.priority === 'number' &&
        Number.isFinite(result.priority) &&
        result.priority >= 0 &&
        result.priority <= 100 &&
        typeof result.reasonCode === 'string' &&
        REASON_CODES.includes(result.reasonCode)
    );
}

async function getSemanticPriority(content) {
    if (!content || typeof content !== 'string' || !content.trim()) {
        return { ...FALLBACK_RESULT, source: 'FALLBACK_EMPTY_CONTENT' };
    }

    try {
        const raw = await callLLM(SYSTEM_PROMPT, content);
        const parsed = extractJson(raw);

        if (!isValid(parsed)) {
            console.warn('[priorityEngine] invalid AI response, falling back:', raw);
            return { ...FALLBACK_RESULT, source: 'FALLBACK_INVALID_AI_RESPONSE' };
        }

        return {
            priority: Math.round(parsed.priority),
            reasonCode: parsed.reasonCode,
            source: 'AI_SCORED',
        };
    } catch (err) {
        console.error('[priorityEngine] AI service error:', err.message);
        return { ...FALLBACK_RESULT, source: 'FALLBACK_AI_SERVICE_ERROR' };
    }
}

module.exports = { getSemanticPriority, REASON_CODES };