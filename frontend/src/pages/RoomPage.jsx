import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useRoomStore from '../store/roomStore.js';
import useSocket from '../hooks/useSocket.js';
import { getRoom } from '../api/roomApi.js';
import { copyToClipboard } from '../utils/format.js';
import VideoPlayer from '../components/player/VideoPlayer.jsx';
import ChatSidebar from '../components/chat/ChatSidebar.jsx';
import UploadPanel from '../components/room/UploadPanel.jsx';
import Spinner from '../components/common/Spinner.jsx';

/* ── Lobby overlay ───────────────────────────────────────── */
const LobbyOverlay = ({ roomId, nickname, setNickname, onJoin }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/95 backdrop-blur-sm p-4">
    <div className="glass-card p-8 w-full max-w-sm text-center animate-slide-up">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-500/15 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-brand-400">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="font-display font-bold text-2xl text-white mb-1">Join Room</h2>
      <p className="text-white/40 text-sm mb-6">
        Room ID: <span className="font-mono text-brand-400">{roomId}</span>
      </p>
      <input
        className="input-field mb-4"
        placeholder="Your nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onJoin()}
        maxLength={24}
        autoFocus
      />
      <button onClick={onJoin} className="btn-primary w-full">Enter Room</button>
    </div>
  </div>
);

/* ── Room page ───────────────────────────────────────────── */
const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [showLobby, setShowLobby] = useState(false);
  const [localNickname, setLocalNickname] = useState('');
  const [roomLoading, setRoomLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { nickname, videoUrl, videoType, isHost: isHostFn, reset } = useRoomStore();
  const isHost = isHostFn();

  const {
    joinRoom, leaveRoom,
    emitVideoUploaded, emitYouTubeSet,
    emitPlay, emitPause, emitSeek, emitSync,
    sendMessage,
  } = useSocket();

  useEffect(() => {
    const init = async () => {
      try {
        await getRoom(roomId);
        if (!nickname) {
          setShowLobby(true);
          setRoomLoading(false);
        } else {
          joinRoom(roomId, nickname);
          setRoomLoading(false);
        }
      } catch {
        toast.error('Room not found or expired');
        navigate('/');
      }
    };
    init();
    return () => { leaveRoom(roomId); reset(); };
  }, [roomId]);

  const handleLobbyJoin = () => {
    const name = localNickname.trim();
    if (!name) { toast.error('Enter a nickname'); return; }
    useRoomStore.getState().setNickname(name);
    setShowLobby(false);
    joinRoom(roomId, name);
  };

  /**
   * Called by UploadPanel when either a file upload OR YouTube URL is set.
   * videoType: 'file' | 'youtube'
   */
  const handleVideoReady = useCallback((videoUrl, videoTitle, videoType) => {
    if (videoType === 'youtube') {
      emitYouTubeSet(roomId, videoUrl, videoTitle);
    } else {
      emitVideoUploaded(roomId, videoUrl, videoTitle);
    }
  }, [roomId, emitVideoUploaded, emitYouTubeSet]);

  const handleSendMessage = useCallback((text) => {
    sendMessage(roomId, text);
  }, [roomId, sendMessage]);

  const copyRoomLink = async () => {
    const ok = await copyToClipboard(window.location.href);
    if (ok) toast.success('Room link copied!');
  };

  if (roomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (showLobby) {
    return <LobbyOverlay roomId={roomId} nickname={localNickname} setNickname={setLocalNickname} onJoin={handleLobbyJoin} />;
  }

  return (
    <div className="h-screen flex flex-col bg-surface-950 overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex-shrink-0 h-14 flex items-center px-4 md:px-6 gap-4 border-b border-white/8 bg-surface-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
              <path d="M15 10l4.55-2.53A1 1 0 0121 8.5v7a1 1 0 01-1.45.89L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
            </svg>
          </div>
          <span className="font-display font-bold text-white text-sm hidden sm:block">WatchTogether</span>
        </div>

        <div className="flex items-center gap-2 bg-surface-700/50 rounded-lg px-3 py-1.5">
          <span className="text-white/40 text-xs">Room:</span>
          <span className="font-mono text-brand-400 text-sm font-medium">{roomId}</span>
        </div>

        <button onClick={copyRoomLink}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round"/>
          </svg>
          Copy Link
        </button>

        {/* Video type badge */}
        {videoUrl && videoType === 'youtube' && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            YouTube
          </span>
        )}

        {isHost && (
          <span className="text-xs bg-brand-500/15 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded-full font-display font-semibold">
            👑 Host
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setSidebarOpen((o) => !o)} className="btn-secondary text-xs py-1.5 px-3">
            {sidebarOpen ? 'Hide Chat' : 'Chat'}
          </button>
          <button onClick={() => { leaveRoom(roomId); navigate('/'); }}
            className="text-white/40 hover:text-red-400 transition-colors text-xs">
            Leave
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0 bg-black">
          {videoUrl ? (
            <VideoPlayer
              emitPlay={emitPlay}
              emitPause={emitPause}
              emitSeek={emitSeek}
              emitSync={emitSync}
            />
          ) : isHost ? (
            <UploadPanel roomId={roomId} onUploaded={handleVideoReady} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-700/50 flex items-center justify-center animate-pulse-soft">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-white/30">
                  <path d="M15 10l4.55-2.53A1 1 0 0121 8.5v7a1 1 0 01-1.45.89L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-white/40 font-display font-medium">Waiting for host to add a video…</p>
              <p className="text-white/20 text-sm mt-1">Host can upload a file or paste a YouTube link</p>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <div className="w-72 md:w-80 flex-shrink-0 animate-slide-in-right">
            <ChatSidebar onSendMessage={handleSendMessage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;