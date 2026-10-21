"use client";

import { useState } from "react";
// import { useRef } from "react";
// import Image from "next/image";
import LuckyWheelModal from "@/components/LuckyWheelModal";

export default function Home() {
  // const audioRef = useRef<HTMLAudioElement | null>(null);
  // const videoRef = useRef<HTMLVideoElement | null>(null);

  // const [isPlayingSong, setIsPlayingSong] = useState(false);
  // const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isSpinModalOpen, setIsSpinModalOpen] = useState(true);

  // const toggleSong = () => {
  //   if (!audioRef.current) return;
  //   if (isPlayingSong) {
  //     audioRef.current.pause();
  //     setIsPlayingSong(false);
  //   } else {
  //     audioRef.current.play();
  //     setIsPlayingSong(true);
  //   }
  // };

  // const toggleVideo = () => {
  //   if (!videoRef.current) return;
  //   if (isPlayingVideo) {
  //     videoRef.current.pause();
  //     setIsPlayingVideo(false);
  //   } else {
  //     videoRef.current.play();
  //     setIsPlayingVideo(true);
  //   }
  // };

  return (
    <div className="container">
      {/* 1. HERO SECTION (Commented out) */}
      {/*
      <section className="hero-section">
        <div className="profile-img-box">
          <Image
            src="/seyha-profile.jpg?v=2"
            alt="Seyha Profile"
            width={160}
            height={160}
            priority
            unoptimized
            className="profile-img"
          />
        </div>
        <h1 className="hero-title">Hello I&apos;m Seyha</h1>
      </section>
      */}

      {/* 2. MEDIA SECTION (Commented out) */}
      {/*
      <section className="media-section">
        <div className="media-item">
          <audio
            ref={audioRef}
            src="/todays-song.mp3"
            preload="none"
            onEnded={() => setIsPlayingSong(false)}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={toggleSong}
          >
            {isPlayingSong ? "⏸ Pause Song" : "🎵 Click Today's Song"}
          </button>
          <span className="status-text">
            {isPlayingSong ? "Playing today's song..." : "Click button to play song"}
          </span>
        </div>

        <div className="media-item">
          <video
            ref={videoRef}
            src="/portfolio-video.mp4"
            className="video-player"
            controls
            playsInline
            preload="metadata"
            onPlay={() => setIsPlayingVideo(true)}
            onPause={() => setIsPlayingVideo(false)}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={toggleVideo}
          >
            {isPlayingVideo ? "⏸ Pause Video" : "▶ Click Play Video"}
          </button>
        </div>
      </section>
      */}

      {/* 3. LAST SECTION (Commented out) */}
      {/*
      <section className="last-section">
        <h2 className="khmer-title">អរគុណ</h2>
        <div className="sticker-box">
          <Image
            src="/haha-cry-sticker.jpg"
            alt="Sticker Haha with cry"
            width={180}
            height={180}
            className="sticker-img"
          />
        </div>
      </section>
      */}

      {/* 4. LUCKY SPIN WHEEL SECTION */}
      <section className="spin-section">
        <div className="spin-card-preview">
          <div className="spin-sparkle-badge">✨ សំណាងមហាសាល ✨</div>
          <h3 className="spin-banner-title">កងបង្វិលយករង្វាន់</h3>
          <p className="spin-banner-desc">
            សាកល្បងសំណាងរបស់អ្នកឥឡូវនេះ ដើម្បីឈ្នះតុក្កតា, ស្ទីគ័រ, ស្ករគ្រាប់ និងរង្វាន់ជាច្រើនទៀត! 🎁
          </p>
          <button
            type="button"
            className="btn-launch-spin"
            onClick={() => setIsSpinModalOpen(true)}
          >
            <span className="spin-btn-wheel-emoji">🎡</span>
            <span>ចុចទីនេះដើម្បីបង្វិលកង (Click To Spin)</span>
          </button>
        </div>
      </section>

      {/* POPUP SPIN MODAL */}
      <LuckyWheelModal
        isOpen={isSpinModalOpen}
        onClose={() => setIsSpinModalOpen(false)}
      />
    </div>
  );
}

