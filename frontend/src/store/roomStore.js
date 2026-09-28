import { create } from 'zustand';

const useRoomStore = create((set, get) => ({
  nickname: '',
  socketId: null,
  roomId: null,
  hostSocketId: null,
  users: [],
  videoUrl: null,
  videoTitle: null,
  videoType: null,       // 'file' | 'youtube'
  isPlaying: false,
  currentTime: 0,
  messages: [],
  uploadProgress: 0,
  isUploading: false,
  isConnected: false,
  isLoading: false,
  error: null,

  setNickname: (nickname) => set({ nickname }),
  setSocketId: (socketId) => set({ socketId }),
  setConnected: (isConnected) => set({ isConnected }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  setRoomState: (state) => set({
    roomId: state.roomId,
    hostSocketId: state.hostSocketId,
    videoUrl: state.videoUrl,
    videoTitle: state.videoTitle,
    videoType: state.videoType || null,
    users: state.users || [],
    messages: state.messages || [],
    isPlaying: state.playbackState?.isPlaying || false,
    currentTime: state.playbackState?.currentTime || 0,
  }),

  setVideo: (videoUrl, videoTitle, videoType) => set({ videoUrl, videoTitle, videoType }),
  setUsers: (users) => set({ users }),
  setHostSocketId: (hostSocketId) => set({ hostSocketId }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setPlaybackState: (isPlaying, currentTime) => set({ isPlaying, currentTime }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  setUploading: (isUploading) => set({ isUploading }),

  isHost: () => {
    const { socketId, hostSocketId } = get();
    return socketId !== null && socketId === hostSocketId;
  },

  reset: () => set({
    roomId: null, hostSocketId: null, users: [], videoUrl: null, videoTitle: null, videoType: null,
    isPlaying: false, currentTime: 0, messages: [], uploadProgress: 0, isUploading: false,
    isConnected: false, error: null,
  }),
}));

export default useRoomStore;