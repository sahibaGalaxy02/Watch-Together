import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import useRoomStore from '../store/roomStore.js';

let socketInstance = null;

const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
};

const useSocket = () => {
  const socket = useRef(getSocket());
  const store = useRoomStore();

  useEffect(() => {
    const s = socket.current;

    s.connect();

    s.on('connect', () => {
      store.setSocketId(s.id);
      store.setConnected(true);
    });

    s.on('disconnect', () => {
      store.setConnected(false);
    });

    s.on('error', ({ message }) => {
      toast.error(message);
    });

    // Room state on join
    s.on('room-state', (state) => {
      store.setRoomState(state);
    });

    // New user joined
    s.on('user-joined', ({ nickname, users }) => {
      store.setUsers(users);
      toast(`${nickname} joined the room`, { icon: '👋' });
    });

    // User left
    s.on('user-left', ({ nickname, users }) => {
      store.setUsers(users);
      toast(`${nickname} left the room`, { icon: '👋' });
    });

    // Host changed
    s.on('host-changed', ({ newHostSocketId, nickname }) => {
      store.setHostSocketId(newHostSocketId);
      toast(`${nickname} is now the host`, { icon: '👑' });
    });

    // Video ready
    s.on('video-ready', ({ videoUrl, videoTitle }) => {
      store.setVideo(videoUrl, videoTitle);
      toast.success(`Video ready: ${videoTitle}`);
    });

    // Playback sync events
    s.on('play-video', ({ currentTime }) => {
      store.setPlaybackState(true, currentTime);
    });
    s.on('pause-video', ({ currentTime }) => {
      store.setPlaybackState(false, currentTime);
    });
    s.on('seek-video', ({ currentTime }) => {
      store.setCurrentTime(currentTime);
    });
    s.on('sync-time', ({ currentTime, isPlaying }) => {
      store.setPlaybackState(isPlaying, currentTime);
    });

    // Chat
    s.on('receive-message', (msg) => {
      store.addMessage(msg);
    });

    return () => {
      s.off('connect');
      s.off('disconnect');
      s.off('error');
      s.off('room-state');
      s.off('user-joined');
      s.off('user-left');
      s.off('host-changed');
      s.off('video-ready');
      s.off('play-video');
      s.off('pause-video');
      s.off('seek-video');
      s.off('sync-time');
      s.off('receive-message');
    };
  }, []);

  const joinRoom = useCallback((roomId, nickname) => {
    socket.current.emit('join-room', { roomId, nickname });
  }, []);

  const leaveRoom = useCallback((roomId) => {
    socket.current.emit('leave-room', { roomId });
  }, []);

  const emitVideoUploaded = useCallback((roomId, videoUrl, videoTitle) => {
    socket.current.emit('video-uploaded', { roomId, videoUrl, videoTitle });
  }, []);

  const emitPlay = useCallback((roomId, currentTime) => {
    socket.current.emit('play-video', { roomId, currentTime });
  }, []);

  const emitPause = useCallback((roomId, currentTime) => {
    socket.current.emit('pause-video', { roomId, currentTime });
  }, []);

  const emitSeek = useCallback((roomId, currentTime) => {
    socket.current.emit('seek-video', { roomId, currentTime });
  }, []);

  const emitSync = useCallback((roomId, currentTime, isPlaying) => {
    socket.current.emit('sync-time', { roomId, currentTime, isPlaying });
  }, []);

  const sendMessage = useCallback((roomId, text) => {
    socket.current.emit('send-message', { roomId, text });
  }, []);

  return {
    socket: socket.current,
    joinRoom,
    leaveRoom,
    emitVideoUploaded,
    emitPlay,
    emitPause,
    emitSeek,
    emitSync,
    sendMessage,
  };
};

export default useSocket;
