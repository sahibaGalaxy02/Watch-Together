import { useRef, useEffect, useState, useCallback } from 'react';
import useRoomStore from '../../store/roomStore.js';
import { formatTime } from '../../utils/format.js';
import Spinner from '../common/Spinner.jsx';

// Max drift (seconds) before forcing a seek on non-host clients
const DRIFT_THRESHOLD = 2;

const VideoPlayer = ({ emitPlay, emitPause, emitSeek, emitSync }) => {
  const videoRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const isSeeking = useRef(false);

  const { roomId, videoUrl, isPlaying, currentTime, isHost: isHostFn } = useRoomStore();
  const isHost = isHostFn();

  const [buffering, setBuffering] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimer = useRef(null);

  // React to external play/pause/seek from store
  useEffect(() => {
    const v = videoRef.current;
    if (!v || isHost) return;

    if (isPlaying) {
      // Drift correction: if current client time differs by more than threshold, seek
      if (Math.abs(v.currentTime - currentTime) > DRIFT_THRESHOLD) {
        v.currentTime = currentTime;
      }
      v.play().catch(() => {});
    } else {
      v.pause();
      if (Math.abs(v.currentTime - currentTime) > 0.5) {
        v.currentTime = currentTime;
      }
    }
  }, [isPlaying, currentTime, isHost]);

  // Host: broadcast sync every 5 seconds
  useEffect(() => {
    if (!isHost) return;
    syncIntervalRef.current = setInterval(() => {
      const v = videoRef.current;
      if (v && roomId) emitSync(roomId, v.currentTime, !v.paused);
    }, 5000);
    return () => clearInterval(syncIntervalRef.current);
  }, [isHost, roomId, emitSync]);

  const handlePlay = useCallback(() => {
    if (!isHost) return;
    emitPlay(roomId, videoRef.current?.currentTime || 0);
  }, [isHost, roomId, emitPlay]);

  const handlePause = useCallback(() => {
    if (!isHost) return;
    emitPause(roomId, videoRef.current?.currentTime || 0);
  }, [isHost, roomId, emitPause]);

  const handleSeeked = useCallback(() => {
    if (!isHost || isSeeking.current) return;
    emitSeek(roomId, videoRef.current?.currentTime || 0);
  }, [isHost, roomId, emitSeek]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setProgress(v.currentTime);
  };

  const handleProgressClick = (e) => {
    if (!isHost) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = ratio * duration;
    videoRef.current.currentTime = newTime;
    emitSeek(roomId, newTime);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v || !isHost) return;
    if (v.paused) { v.play(); emitPlay(roomId, v.currentTime); }
    else { v.pause(); emitPause(roomId, v.currentTime); }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) container.requestFullscreen();
    else document.exitFullscreen();
  };

  const showCtrl = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  if (!videoUrl) return null;

  return (
    <div className="relative w-full aspect-video bg-black group" onMouseMove={showCtrl} onMouseLeave={() => setShowControls(false)}>
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeeked}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onPlaying={() => setBuffering(false)}
        onClick={isHost ? togglePlay : undefined}
        volume={volume}
        muted={muted}
      />

      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Spinner size="lg" />
        </div>
      )}

      {!isHost && (
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white/70 text-xs px-3 py-1 rounded-full font-mono">
          Viewer mode
        </div>
      )}

      {/* Controls overlay */}
      <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress bar */}
        <div
          className={`w-full h-1.5 bg-white/20 rounded-full mb-3 relative ${isHost ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={handleProgressClick}
        >
          <div className="h-full bg-brand-500 rounded-full transition-all"
               style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }} />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3">
          {isHost && (
            <button onClick={togglePlay} className="text-white hover:text-brand-400 transition-colors">
              {videoRef.current?.paused ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              )}
            </button>
          )}

          <span className="text-white/70 text-xs font-mono">
            {formatTime(progress)} / {formatTime(duration)}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setMuted((m) => !m)} className="text-white/70 hover:text-white transition-colors">
              {muted ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0017.73 18L19 19.27 20.27 18 5.27 3 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
              )}
            </button>
            <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
              className="w-16 accent-brand-500"
              onChange={(e) => { setVolume(+e.target.value); setMuted(+e.target.value === 0); if (videoRef.current) videoRef.current.volume = +e.target.value; }}
            />
            <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
