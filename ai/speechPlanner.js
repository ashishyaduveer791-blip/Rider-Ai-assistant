const { callLLM } = require('./aiService');

function buildFallback(originalContent) {
    return { spokenText: originalContent.trim(), source: 'FALLBACK_RAW_CONTENT' };
}

const SYSTEM_PROMPT = `You are a speech planner for a delivery-rider voice assistant.
Your job is to rewrite a rambling, real-world message into a SHORT,
clear, spoken-friendly instruction the rider can act on immediately.

Rules:
- Keep every critical fact (gate numbers, addresses, times, names of places).
- Remove greetings, filler words, repetition, and side comments.
- Prefer short imperative sentences ("Use Gate 3. Gate 1 is closed.").
- Aim for under 20 words when possible.
- Do not invent information that isn't in the original message.
- LANGUAGE RULE: Respond in the SAME language as the input. If the input is in Hindi, respond in Hindi. If it's in English, respond in English. If it's Hinglish (mixed), respond in simple Hinglish or English — whichever is clearer as a spoken instruction.
- Do not explain your reasoning.

Respond with ONLY a raw JSON object, no markdown, no extra text, exactly:
{"spokenText": "<the short, TTS-ready sentence>"}`;

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
        typeof result.spokenText === 'string' &&
        result.spokenText.trim().length > 0 &&
        result.spokenText.length <= 300
    );
}

async function planSpeech(content) {
    if (!content || typeof content !== 'string' || !content.trim()) {
        return { spokenText: '', source: 'FALLBACK_EMPTY_CONTENT' };
    }

    try {
        const raw = await callLLM(SYSTEM_PROMPT, content, { timeoutMs: 20000 });
        const parsed = extractJson(raw);

        if (!isValid(parsed)) {
            console.warn('[speechPlanner] invalid AI response, falling back:', raw);
            return buildFallback(content);
        }

        return { spokenText: parsed.spokenText.trim(), source: 'AI_PLANNED' };
    } catch (err) {
        console.error('[speechPlanner] AI service error:', err.message);
        return buildFallback(content);
    }
}

module.exports = { planSpeech };