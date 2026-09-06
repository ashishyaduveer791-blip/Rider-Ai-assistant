/**
 * Text-to-Speech (TTS) Service for Rider AI Assistant Cockpit
 * Uses Web Speech API (SpeechSynthesis) to voice priority alerts directly into rider headset/speakers.
 */

let isMuted = localStorage.getItem('rider_tts_muted') === 'true';
let currentUtterance = null;
let cachedVoice = null;

// Initialize best available voice
function getPreferredVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (cachedVoice) return cachedVoice;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Prefer natural English voices (US, UK, Indian English suited for Prem Nagar / UPES delivery context)
  const preferred = voices.find(v => 
    v.lang.startsWith('en') && (
      v.name.includes('Natural') || 
      v.name.includes('Google') || 
      v.name.includes('Samantha') || 
      v.name.includes('Karen') ||
      v.name.includes('Zira') ||
      v.name.includes('India')
    )
  ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

  cachedVoice = preferred;
  return preferred;
}

// Pre-load voices
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    getPreferredVoice();
  };
}

export const ttsService = {
  isMuted() {
    return isMuted;
  },

  setMuted(muted) {
    isMuted = !!muted;
    localStorage.setItem('rider_tts_muted', isMuted ? 'true' : 'false');
    if (isMuted) {
      this.cancel();
    }
    // Dispatch custom event for UI reaction
    window.dispatchEvent(new CustomEvent('rider-tts-mute-change', { detail: { isMuted } }));
    return isMuted;
  },

  toggleMute() {
    return this.setMuted(!isMuted);
  },

  cancel() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    currentUtterance = null;
  },

  speak(text, { onStart, onEnd, onError, rate = 1.05, pitch = 1.0 } = {}) {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any ongoing speech first
    this.cancel();

    if (isMuted) {
      console.log('[TTS] Audio muted by rider preference. Simulating speech timing.');
      if (onStart) onStart();
      // Estimate reading time (~180 words per minute)
      const durationMs = Math.max(2500, Math.min(6000, (text.split(' ').length / 3) * 1000));
      setTimeout(() => {
        if (onEnd) onEnd();
      }, durationMs);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      currentUtterance = utterance;

      const voice = getPreferredVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        console.log('[TTS] Started speaking:', text);
        if (onStart) onStart();
      };

      utterance.onend = () => {
        console.log('[TTS] Finished speaking.');
        currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (err) => {
        console.warn('[TTS] Synthesis error or interrupted:', err);
        currentUtterance = null;
        if (onError) onError(err);
        else if (onEnd) onEnd();
      };

      // Ensure speech synthesis is resumed if browser paused it
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('[TTS] Failed to execute speech synthesis:', err);
      if (onEnd) onEnd();
    }
  },
};

export default ttsService;
