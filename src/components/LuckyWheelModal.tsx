"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Sparkles, Send, RotateCw, Volume2, VolumeX, Trophy } from "lucide-react";

interface WheelSegment {
  id: number;
  label: string;
  subLabel: string;
  icon: string;
  bgGradient: [string, string];
  textColor: string;
  isDoll: boolean;
  dollNumber?: number;
}

const SEGMENTS: WheelSegment[] = [
  {
    id: 0,
    label: "អរគុណ",
    subLabel: "Thanks You",
    icon: "🙏",
    bgGradient: ["#854d0e", "#b45309"], // Golden amber
    textColor: "#fef08a",
    isDoll: false,
  },
  {
    id: 1,
    label: "តុក្កតា",
    subLabel: "Doll #1",
    icon: "🧸",
    bgGradient: ["#1e3a8a", "#2563eb"], // Royal blue
    textColor: "#ffffff",
    isDoll: true,
    dollNumber: 1,
  },
  {
    id: 2,
    label: "តុក្កតា",
    subLabel: "Doll #2",
    icon: "🧸",
    bgGradient: ["#064e3b", "#059669"], // Emerald
    textColor: "#ffffff",
    isDoll: true,
    dollNumber: 2,
  },
  {
    id: 3,
    label: "តុក្កតា",
    subLabel: "Doll #3",
    icon: "🧸",
    bgGradient: ["#881337", "#e11d48"], // Crimson ruby
    textColor: "#ffffff",
    isDoll: true,
    dollNumber: 3,
  },
  {
    id: 4,
    label: "តុក្កតា",
    subLabel: "Doll #4",
    icon: "🧸",
    bgGradient: ["#581c87", "#9333ea"], // Imperial purple
    textColor: "#ffffff",
    isDoll: true,
    dollNumber: 4,
  },
];

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LuckyWheelModal({ isOpen, onClose }: LuckyWheelModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [resultSegment, setResultSegment] = useState<WheelSegment | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Keep track of total rotation accumulated so spins always accelerate forward
  const currentRotationRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play web audio synthesis tick sound
  const playTickSound = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // AudioContext error suppressed if disabled by browser autoplay policy
    }
  }, [soundEnabled]);

  // Fanfare sound on win
  const playWinSound = useCallback((isDoll: boolean) => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      const notes = isDoll ? [523.25, 659.25, 783.99, 1046.5] : [392, 440, 523.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.35);
      });
    } catch {
      // AudioContext error suppressed
    }
  }, [soundEnabled]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSpinning && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSpinning, onClose]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setShowResultModal(false);
      setResultSegment(null);
      setTelegramStatus(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Spin trigger function with exact mathematical odds:
  // 99.9999% Thanks You, 0.0001% (or 0.000001% each) for the 4 dolls
  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowResultModal(false);
    setResultSegment(null);
    setTelegramStatus("កំពុងរង់ចាំលទ្ធផល...");

    // Sound activation
    playTickSound();

    // 1. Determine Winning Segment:
    // User requirement:
    // "only 1 Thanks You and other 4 is តុក្កតា. Make spin with khmer design and also set the percent of thanks you is 99.9999 and 0.000001 for there 4 តុក្កតា"
    const roll = Math.random() * 100;
    let selectedIndex = 0; // Segment 0 = Thanks You

    // Thanks you is 99.9999%, so if roll is > 99.9999 it's a rare doll winner!
    if (roll > 99.9999) {
      // Pick one of the 4 doll segments [1, 2, 3, 4]
      selectedIndex = Math.floor(Math.random() * 4) + 1;
    } else {
      selectedIndex = 0;
    }

    const winningSegment = SEGMENTS[selectedIndex];

    // 2. Wheel geometry & target angle calculation:
    // 5 segments = 72 degrees each.
    // Segment 0 spans from 0° to 72° (center at 36°)
    // The top pointer points down at 12 o'clock (0°).
    // To position segment i under 0° at the top:
    // Target wheel rotation mod 360 = (360 - (i * 72 + 36)) % 360
    const segmentAngle = 360 / SEGMENTS.length; // 72 deg
    const segmentCenter = selectedIndex * segmentAngle + segmentAngle / 2;
    // Add natural randomness so pointer lands smoothly inside the segment (safe margin ±24 deg)
    const randomJitter = (Math.random() - 0.5) * 44;
    const targetBaseAngle = (360 - segmentCenter + randomJitter + 360) % 360;

    // Minimum 6 full spins (2160 deg) plus extra random spins for excitement
    const extraSpins = (6 + Math.floor(Math.random() * 3)) * 360;
    const currentMod = currentRotationRef.current % 360;
    const angleDelta = (targetBaseAngle - currentMod + 360) % 360;

    const newTargetRotation = currentRotationRef.current + extraSpins + angleDelta;
    currentRotationRef.current = newTargetRotation;
    setRotationDegree(newTargetRotation);

    // Audio ticking intervals during the 5.2s spin
    const spinDuration = 5200;
    const tickIntervals = [
      80, 80, 80, 85, 90, 95, 100, 110, 120, 135, 155, 180, 210, 250, 300, 360,
      430, 520, 630, 780,
    ];
    tickIntervals.reduce((acc, delay) => {
      setTimeout(() => {
        playTickSound();
      }, acc);
      return acc + delay;
    }, 100);

    // When spin animation completes
    setTimeout(async () => {
      setIsSpinning(false);
      setResultSegment(winningSegment);
      setShowResultModal(true);
      playWinSound(winningSegment.isDoll);

      // Send Spin Notification to Telegram Bot via Next.js Server API
      try {
        setTelegramStatus("កំពុងផ្ញើលទ្ធផលទៅកាន់ Telegram Bot...");
        const res = await fetch("/api/spin-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prize: winningSegment.isDoll
              ? `តុក្កតា #${winningSegment.dollNumber}`
              : "អរគុណ (Thanks You)",
            isDoll: winningSegment.isDoll,
            dollNumber: winningSegment.dollNumber,
            clientTime: new Intl.DateTimeFormat("km-KH", {
              dateStyle: "full",
              timeStyle: "medium",
            }).format(new Date()),
          }),
        });
        const data = await res.json();
        if (data.delivered) {
          setTelegramStatus("✅ បានផ្ញើលទ្ធផលទៅ Telegram Bot ដោយជោគជ័យ!");
        } else if (data.warning) {
          setTelegramStatus("ℹ️ បានកត់ត្រាលទ្ធផល (សូមដាក់ Telegram Token ក្នុង .env.local)");
        } else {
          setTelegramStatus("⚠️ មិនអាចផ្ញើទៅ Telegram បានទេ");
        }
      } catch (err) {
        console.error("Failed to notify Telegram:", err);
        setTelegramStatus("⚠️ បញ្ហាក្នុងការភ្ជាប់ទៅ Telegram");
      }
    }, spinDuration);
  };

  if (!isOpen) return null;

  return (
    <div className="wheel-modal-overlay" onClick={() => !isSpinning && onClose()}>
      {/* Modal Container */}
      <div
        className="wheel-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Khmer Royal Header */}
        <div className="wheel-modal-header">
          <div className="khmer-emblem">☸️</div>
          <div className="wheel-title-box">
            <h2 className="wheel-main-title">កងបង្វិលសំណាង</h2>
            <p className="wheel-sub-title">Khmer Lucky Spin Wheel 🎁</p>
          </div>
          <button
            type="button"
            className="wheel-close-btn"
            onClick={onClose}
            disabled={isSpinning}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Sound Toggle Button */}
        <div className="wheel-toolbar" style={{ justifyContent: "flex-end" }}>
          <button
            type="button"
            className="sound-toggle-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "បិទសំឡេង" : "បើកសំឡេង"}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>

        {/* WHEEL STAGE */}
        <div className="wheel-stage-container">
          {/* Outer Khmer Golden Ornate Rim with Bulbs */}
          <div className="khmer-outer-frame">
            {/* Glowing Gem Bulbs around rim */}
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="frame-bulb"
                style={{
                  transform: `rotate(${i * 18}deg) translateY(-166px)`,
                }}
              />
            ))}

            {/* Top Pointer Arrow (Golden Khmer Arrow) */}
            <div className="khmer-wheel-pointer">
              <div className="pointer-tip" />
              <div className="pointer-gem" />
            </div>

            {/* Rotating SVG Wheel */}
            <div
              className="wheel-disc-wrapper"
              style={{
                transform: `rotate(${rotationDegree}deg)`,
                transition: isSpinning
                  ? "transform 5.2s cubic-bezier(0.12, 0.8, 0.32, 1)"
                  : "none",
              }}
            >
              <svg
                viewBox="0 0 400 400"
                className="wheel-svg"
                width="100%"
                height="100%"
              >
                <defs>
                  {/* Segment Gradients */}
                  {SEGMENTS.map((seg) => (
                    <radialGradient
                      key={seg.id}
                      id={`seg-grad-${seg.id}`}
                      cx="50%"
                      cy="50%"
                      r="50%"
                      fx="50%"
                      fy="50%"
                    >
                      <stop offset="0%" stopColor={seg.bgGradient[1]} />
                      <stop offset="100%" stopColor={seg.bgGradient[0]} />
                    </radialGradient>
                  ))}
                  {/* Gold border filter */}
                  <linearGradient id="gold-metal" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="30%" stopColor="#eab308" />
                    <stop offset="70%" stopColor="#ca8a04" />
                    <stop offset="100%" stopColor="#854d0e" />
                  </linearGradient>
                </defs>

                {/* Draw 5 Segments */}
                {SEGMENTS.map((seg, index) => {
                  const segAngle = 360 / SEGMENTS.length;
                  const startAngle = index * segAngle - 90; // -90 so 0 is at 12 o'clock
                  const endAngle = (index + 1) * segAngle - 90;

                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;

                  const r = 188;
                  const cx = 200;
                  const cy = 200;

                  const x1 = cx + r * Math.cos(startRad);
                  const y1 = cy + r * Math.sin(startRad);
                  const x2 = cx + r * Math.cos(endRad);
                  const y2 = cy + r * Math.sin(endRad);

                  const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

                  // Mid-angle for text placement
                  const midAngle = startAngle + segAngle / 2;
                  const textRad = (midAngle * Math.PI) / 180;
                  // Distance from center for label
                  const textR = 120;
                  const textX = cx + textR * Math.cos(textRad);
                  const textY = cy + textR * Math.sin(textRad);

                  return (
                    <g key={seg.id} className="wheel-slice">
                      <path
                        d={pathData}
                        fill={`url(#seg-grad-${seg.id})`}
                        stroke="url(#gold-metal)"
                        strokeWidth="3.5"
                      />
                      {/* Slice Content rotated along radius */}
                      <g
                        transform={`translate(${textX}, ${textY}) rotate(${
                          midAngle + 90
                        })`}
                      >
                        <text
                          textAnchor="middle"
                          fill={seg.textColor}
                          fontSize="24"
                          y="-16"
                        >
                          {seg.icon}
                        </text>
                        <text
                          textAnchor="middle"
                          fill={seg.textColor}
                          fontSize="15"
                          fontWeight="700"
                          fontFamily="var(--font-khmer)"
                          y="6"
                        >
                          {seg.label}
                        </text>
                        <text
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.85)"
                          fontSize="11"
                          fontWeight="600"
                          y="20"
                        >
                          {seg.subLabel}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Outer Circular Ring Ornament */}
                <circle
                  cx="200"
                  cy="200"
                  r="188"
                  fill="none"
                  stroke="url(#gold-metal)"
                  strokeWidth="6"
                />
              </svg>
            </div>

            {/* Central SPIN Button / Khmer Lotus Core */}
            <button
              type="button"
              className="center-spin-hub"
              onClick={spinWheel}
              disabled={isSpinning}
              aria-label="Spin Wheel"
            >
              <div className="hub-inner">
                <span className="hub-khmer-text">
                  {isSpinning ? "..." : "បង្វិល"}
                </span>
                <span className="hub-eng-text">
                  {isSpinning ? "SPINNING" : "SPIN"}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Action Controls & Telegram Status */}
        <div className="wheel-controls">
          <button
            type="button"
            className="btn-spin-action"
            onClick={spinWheel}
            disabled={isSpinning}
          >
            {isSpinning ? (
              <>
                <RotateCw className="spin-icon-anim" size={20} />
                <span>កំពុងបង្វិល... (Spinning...)</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>ចុចបង្វិលកងសំណាង (Click To Spin)</span>
              </>
            )}
          </button>

          {/* Telegram Alert Status Line */}
          <div className="telegram-status-bar">
            <Send size={14} className="tg-icon" />
            <span className="tg-text">
              {telegramStatus || "🔔 រាល់ការបង្វិលនឹងបញ្ជូនលទ្ធផលទៅកាន់ Telegram Bot"}
            </span>
          </div>
        </div>

        {/* RESULT POPUP MODAL (When wheel lands on segment) */}
        {showResultModal && resultSegment && (
          <div className="result-backdrop">
            <div className="result-card">
              <div className="result-badge-icon">
                {resultSegment.isDoll ? "🧸🎉" : "🙏😂"}
              </div>

              {resultSegment.isDoll ? (
                <>
                  <h3 className="result-title winner-title">
                    អបអរសាទរ! អ្នកបានឈ្នះរង្វាន់!
                  </h3>
                  <p className="result-subtitle">
                    🎉 អ្នកទទួលបាន <strong>តុក្កតា #{resultSegment.dollNumber}</strong> ដ៏ស្រស់ស្អាត!
                  </p>
                  <div className="result-trophy-box">
                    <Trophy size={48} className="trophy-gold" />
                    <span>សំណាងពិតជាអស្ចារ្យណាស់!</span>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="result-title thanks-title">
                    អរគុណច្រើន! (Thanks You)
                  </h3>
                  <p className="result-subtitle">
                    សូមអរគុណសម្រាប់ការចូលរួមលេងកម្សាន្ត!
                    <br />
                    កុំទាន់អស់សង្ឃឹម សាកល្បងម្ដងទៀតណា៎ 🤣
                  </p>
                  <div className="result-sticker-box">
                    <Image
                      src="/haha-cry-sticker.jpg"
                      alt="Sticker Haha with cry"
                      width={120}
                      height={120}
                      className="result-sticker"
                    />
                  </div>
                </>
              )}

              {/* Action Buttons in Result */}
              <div className="result-actions">
                <button
                  type="button"
                  className="btn-result-again"
                  onClick={() => {
                    setShowResultModal(false);
                    spinWheel();
                  }}
                >
                  <RotateCw size={18} />
                  <span>បង្វិលម្ដងទៀត (Spin Again)</span>
                </button>
                <button
                  type="button"
                  className="btn-result-close"
                  onClick={() => setShowResultModal(false)}
                >
                  បិទ (Close)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
