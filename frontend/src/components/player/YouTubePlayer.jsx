import { useRef, useEffect, useState, useCallback } from 'react';
import useRoomStore from '../../store/roomStore.js';
import Spinner from '../common/Spinner.jsx';

/**
 * YouTube IFrame Player with postMessage-based sync.
 * Host controls are relayed via Socket → store → viewer iframes.
 *
 * YouTube IFrame API reference:
 * https://developers.google.com/youtube/iframe_api_reference
 */
const YouTubePlayer = ({ emitPlay, emitPause, emitSeek, emitSync }) => {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);   // YT.Player instance
  const syncIntervalRef = useRef(null);
  const ignoreNextEvent = useRef(false); // prevent echo loops

  const { roomId, videoUrl, isPlaying, currentTime, isHost: isHostFn } = useRoomStore();
  const isHost = isHostFn();

  const [ready, setReady] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef(null);

  /* Load YT IFrame API once */
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = initPlayer;

    return () => { window.onYouTubeIframeAPIReady = null; };
  }, [videoUrl]);

  const initPlayer = () => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    // Extract video ID from embed URL
    const match = videoUrl?.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (!match) return;

    playerRef.current = new window.YT.Player(iframeRef.current, {
      videoId: match[1],
      playerVars: {
        controls: isHost ? 1 : 0,  // hide YT controls for viewers
        rel: 0,
        modestbranding: 1,
        enablejsapi: 1,
      },
      events: {
        onReady: () => setReady(true),
        onStateChange: handleStateChange,
      },
    });
  };

  const handleStateChange = useCallback((event) => {
    if (!isHost || ignoreNextEvent.current) {
      ignoreNextEvent.current = false;
      return;
    }
    const YT = window.YT.PlayerState;
    const t = playerRef.current?.getCurrentTime() || 0;

    if (event.data === YT.PLAYING)  emitPlay(roomId, t);
    if (event.data === YT.PAUSED)   emitPause(roomId, t);
  }, [isHost, roomId, emitPlay, emitPause]);

  /* Host: periodic sync broadcast */
  useEffect(() => {
    if (!isHost || !ready) return;
    syncIntervalRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      const t = p.getCurrentTime?.() || 0;
      const playing = p.getPlayerState?.() === window.YT?.PlayerState?.PLAYING;
      emitSync(roomId, t, playing);
    }, 5000);
    return () => clearInterval(syncIntervalRef.current);
  }, [isHost, ready, roomId, emitSync]);

  /* Viewer: react to store changes */
  useEffect(() => {
    const p = playerRef.current;
    if (!p || isHost || !ready) return;
    ignoreNextEvent.current = true;

    const playerTime = p.getCurrentTime?.() || 0;
    const DRIFT = 2;

    if (isPlaying) {
      if (Math.abs(playerTime - currentTime) > DRIFT) p.seekTo?.(currentTime, true);
      p.playVideo?.();
    } else {
      p.pauseVideo?.();
      if (Math.abs(playerTime - currentTime) > 0.5) p.seekTo?.(currentTime, true);
    }
  }, [isPlaying, currentTime, isHost, ready]);

  const showCtrl = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <div className="relative w-full aspect-video bg-black" onMouseMove={showCtrl}>
      {/* The div YT replaces with the iframe */}
      <div ref={iframeRef} className="w-full h-full" />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <Spinner size="lg" />
        </div>
      )}

      {!isHost && ready && (
        <div className={`absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white/70 text-xs px-3 py-1 rounded-full font-mono transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          Viewer mode
        </div>
      )}

      {/* Transparent overlay for viewers to block YT UI interactions */}
      {!isHost && (
        <div className="absolute inset-0 cursor-default" style={{ zIndex: 1 }} />
      )}
    </div>
  );
};

export default YouTubePlayer;