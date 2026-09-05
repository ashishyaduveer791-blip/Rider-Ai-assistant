/* ==========================================================================
   AIGlobe Component
   Futuristic glowing AI globes inspired by Siri / Gemini / Cortana:
   - listening: Chromatic fluid plasma orb (cyan, magenta, gold swirls)
   - thinking: 3D cybernetic particle mesh & quantum orbital rings
   - speaking: Resonant vocal ribbon vortex & acoustic energy flares
   - idle: Calm, completely static resting luminescent glass orb
   ========================================================================== */

export default function AIGlobe({ state = 'listening' }) {
  return (
    <div className={`ai-globe-viewport globe-state-${state}`} aria-label={`AI Globe: ${state}`}>
      {/* 1. Deep Space Glass Spherical Base */}
      <div className="globe-sphere-body">
        {/* Ambient Core Glow */}
        <div className="globe-ambient-glow" />

        {/* ── STATE 1: LISTENING (Chromatic Fluid Plasma Orb) ── */}
        {state === 'listening' && (
          <div className="globe-visual-layer plasma-layer">
            <svg viewBox="0 0 100 100" className="globe-svg-canvas" fill="none">
              <defs>
                <radialGradient id="plasmaGrad1" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.85" />
                  <stop offset="70%" stopColor="#818cf8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="plasmaGrad2" cx="65%" cy="65%" r="60%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#ec4899" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#4c0519" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="plasmaCoreGlow" cx="50%" cy="50%" r="45%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#ec4899" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>
                <filter id="plasmaFluidBlur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
                </filter>
              </defs>

              <g filter="url(#plasmaFluidBlur)">
                {/* Flowing chromatic blobs */}
                <circle cx="45" cy="48" r="22" fill="url(#plasmaGrad1)" className="plasma-blob blob-cyan" />
                <circle cx="56" cy="52" r="20" fill="url(#plasmaGrad2)" className="plasma-blob blob-magenta" />
                <ellipse cx="50" cy="50" rx="15" ry="12" fill="url(#plasmaCoreGlow)" className="plasma-blob blob-gold" />
              </g>

              {/* Luminous acoustic undulating orbit */}
              <circle cx="50" cy="50" r="32" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1.2" strokeDasharray="6 3" className="plasma-orbit-ring" />
            </svg>
          </div>
        )}

        {/* ── STATE 2: THINKING (Quantum Particle Mesh & Orbital Matrix) ── */}
        {state === 'thinking' && (
          <div className="globe-visual-layer quantum-layer">
            <svg viewBox="0 0 100 100" className="globe-svg-canvas" fill="none">
              <defs>
                <linearGradient id="quantumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>

              {/* Central Pulsing Quantum Core */}
              <circle cx="50" cy="50" r="10" fill="url(#quantumGrad)" className="quantum-core-pulse" />

              {/* Revolving Orbital Rings */}
              <g className="quantum-orbit-group-1">
                <ellipse cx="50" cy="50" rx="33" ry="14" stroke="rgba(56, 189, 248, 0.65)" strokeWidth="1.4" strokeDasharray="3 4" />
                <circle cx="83" cy="50" r="2.5" fill="#38bdf8" className="orbit-node node-1" />
                <circle cx="17" cy="50" r="2" fill="#38bdf8" className="orbit-node node-2" />
              </g>

              <g className="quantum-orbit-group-2">
                <ellipse cx="50" cy="50" rx="31" ry="16" stroke="rgba(192, 132, 252, 0.7)" strokeWidth="1.4" strokeDasharray="4 3" />
                <circle cx="50" cy="34" r="2.5" fill="#c084fc" className="orbit-node node-3" />
                <circle cx="50" cy="66" r="2" fill="#ec4899" className="orbit-node node-4" />
              </g>

              <g className="quantum-orbit-group-3">
                <ellipse cx="50" cy="50" rx="26" ry="26" stroke="rgba(236, 72, 153, 0.4)" strokeWidth="1" strokeDasharray="2 5" />
              </g>

              {/* Center crosshair / particle nodes */}
              <circle cx="50" cy="50" r="3" fill="#ffffff" />
            </svg>
          </div>
        )}

        {/* ── STATE 3: SPEAKING (Resonant Vocal Ribbons & Acoustic Waves) ── */}
        {state === 'speaking' && (
          <div className="globe-visual-layer vocal-layer">
            <svg viewBox="0 0 100 100" className="globe-svg-canvas" fill="none">
              <defs>
                <linearGradient id="vocalGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="50%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="vocalGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>

              {/* Pulsing Acoustic Rings */}
              <circle cx="50" cy="50" r="18" stroke="rgba(244, 63, 94, 0.5)" strokeWidth="1.5" className="vocal-pulse-ring ring-1" />
              <circle cx="50" cy="50" r="28" stroke="rgba(251, 146, 60, 0.4)" strokeWidth="1.2" className="vocal-pulse-ring ring-2" />

              {/* Dynamic Twisted Ribbon Curves */}
              <path
                d="M 22 50 C 32 30, 45 68, 55 38 C 65 65, 74 35, 78 50"
                stroke="url(#vocalGrad1)"
                strokeWidth="3.2"
                strokeLinecap="round"
                className="vocal-ribbon ribbon-primary"
              />
              <path
                d="M 24 46 C 36 62, 48 32, 60 60 C 68 40, 75 56, 77 48"
                stroke="url(#vocalGrad2)"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="vocal-ribbon ribbon-secondary"
              />

              {/* Central Resonance Node */}
              <circle cx="50" cy="50" r="6" fill="#ffffff" className="vocal-center-dot" />
            </svg>
          </div>
        )}

        {/* ── STATE 4: IDLE (Futuristic Celestial Luminescent AI Orb - Calm & Static) ── */}
        {state === 'idle' && (
          <div className="globe-visual-layer idle-static-layer">
            <svg viewBox="0 0 100 100" className="globe-svg-canvas" fill="none">
              <defs>
                <radialGradient id="idleNebulaGrad" cx="50%" cy="50%" r="55%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.85" />
                  <stop offset="55%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <stop offset="85%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0b0f19" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="idleRingGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="idleRingGradViolet" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.35" />
                </linearGradient>
              </defs>

              {/* Luminous Inner Core Glow */}
              <circle cx="50" cy="50" r="24" fill="url(#idleNebulaGrad)" />

              {/* 3D Celestial Gyroscopic Wireframe Rings (Static) */}
              <ellipse cx="50" cy="50" rx="34" ry="13" stroke="url(#idleRingGradCyan)" strokeWidth="1.2" strokeDasharray="3 3" />
              <ellipse cx="50" cy="50" rx="14" ry="34" stroke="url(#idleRingGradViolet)" strokeWidth="1.2" strokeDasharray="4 3" />
              <circle cx="50" cy="50" r="31" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" strokeDasharray="5 4" />

              {/* Symmetrical Cardinal Star Nodes */}
              <circle cx="50" cy="16" r="2" fill="#38bdf8" />
              <circle cx="50" cy="84" r="2" fill="#38bdf8" />
              <circle cx="16" cy="50" r="2" fill="#c084fc" />
              <circle cx="84" cy="50" r="2" fill="#c084fc" />

              {/* Brilliant Center Crystal Nucleus */}
              <circle cx="50" cy="50" r="7" fill="rgba(56, 189, 248, 0.4)" />
              <circle cx="50" cy="50" r="3.5" fill="#ffffff" />
            </svg>
          </div>
        )}

        {/* 2. Realistic 3D Glass Surface Specular Sheen (Upper Hemisphere) */}
        <div className="globe-glass-sheen" />
      </div>
    </div>
  )
}
