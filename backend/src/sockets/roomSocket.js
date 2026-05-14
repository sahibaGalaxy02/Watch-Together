import Room from '../models/Room.js';

/**
 * In-memory map of active rooms:
 * roomId -> { hostSocketId, users: Map<socketId, { nickname, socketId }> }
 */
const activeRooms = new Map();

const registerRoomSocket = (io, socket) => {
  // JOIN ROOM
  socket.on('join-room', async ({ roomId, nickname }) => {
    try {
      const room = await Room.findOne({ roomId, isActive: true });
      if (!room) { socket.emit('error', { message: 'Room not found or inactive' }); return; }

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.nickname = nickname;

      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, { hostSocketId: socket.id, users: new Map() });
      }

      const memRoom = activeRooms.get(roomId);
      memRoom.users.set(socket.id, { nickname, socketId: socket.id });

      if (memRoom.users.size === 1 || room.hostId === 'pending') {
        memRoom.hostSocketId = socket.id;
        await Room.updateOne({ roomId }, { hostId: socket.id });
      }

      const usersArray = Array.from(memRoom.users.values());

      socket.emit('room-state', {
        roomId,
        hostSocketId: memRoom.hostSocketId,
        videoUrl: room.videoUrl,
        videoTitle: room.videoTitle,
        playbackState: room.playbackState,
        users: usersArray,
        messages: room.messages.slice(-50),
      });

      socket.to(roomId).emit('user-joined', { socketId: socket.id, nickname, users: usersArray });
      console.log("[JOIN]", nickname, socket.id, "->", roomId);
    } catch (err) {
      console.error('[join-room error]', err.message);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // VIDEO UPLOADED
  socket.on('video-uploaded', ({ roomId, videoUrl, videoTitle }) => {
    const memRoom = activeRooms.get(roomId);
    if (!memRoom || memRoom.hostSocketId !== socket.id) return;
    io.to(roomId).emit('video-ready', { videoUrl, videoTitle });
  });

  // PLAY
  socket.on('play-video', async ({ roomId, currentTime }) => {
    const memRoom = activeRooms.get(roomId);
    if (!memRoom || memRoom.hostSocketId !== socket.id) return;
    await Room.updateOne({ roomId }, { 'playbackState.isPlaying': true, 'playbackState.currentTime': currentTime, 'playbackState.updatedAt': new Date() });
    socket.to(roomId).emit('play-video', { currentTime });
  });

  // PAUSE
  socket.on('pause-video', async ({ roomId, currentTime }) => {
    const memRoom = activeRooms.get(roomId);
    if (!memRoom || memRoom.hostSocketId !== socket.id) return;
    await Room.updateOne({ roomId }, { 'playbackState.isPlaying': false, 'playbackState.currentTime': currentTime, 'playbackState.updatedAt': new Date() });
    socket.to(roomId).emit('pause-video', { currentTime });
  });

  // SEEK
  socket.on('seek-video', async ({ roomId, currentTime }) => {
    const memRoom = activeRooms.get(roomId);
    if (!memRoom || memRoom.hostSocketId !== socket.id) return;
    await Room.updateOne({ roomId }, { 'playbackState.currentTime': currentTime, 'playbackState.updatedAt': new Date() });
    socket.to(roomId).emit('seek-video', { currentTime });
  });

  // SYNC (host broadcasts periodically for drift correction)
  socket.on('sync-time', ({ roomId, currentTime, isPlaying }) => {
    const memRoom = activeRooms.get(roomId);
    if (!memRoom || memRoom.hostSocketId !== socket.id) return;
    socket.to(roomId).emit('sync-time', { currentTime, isPlaying });
  });

  // CHAT
  socket.on('send-message', async ({ roomId, text }) => {
    const nickname = socket.data.nickname || 'Anonymous';
    const message = { userId: socket.id, nickname, text, timestamp: new Date() };
    await Room.updateOne({ roomId }, { $push: { messages: message } });
    io.to(roomId).emit('receive-message', message);
  });

  // LEAVE / DISCONNECT
  const handleLeave = async (roomId) => {
    if (!roomId) return;
    const memRoom = activeRooms.get(roomId);
    if (!memRoom) return;
    memRoom.users.delete(socket.id);
    const usersArray = Array.from(memRoom.users.values());

    if (memRoom.users.size === 0) {
      activeRooms.delete(roomId);
      await Room.updateOne({ roomId }, { isActive: false });
      return;
    }

    if (memRoom.hostSocketId === socket.id) {
      const newHostId = memRoom.users.keys().next().value;
      memRoom.hostSocketId = newHostId;
      await Room.updateOne({ roomId }, { hostId: newHostId });
      io.to(roomId).emit('host-changed', { newHostSocketId: newHostId, nickname: memRoom.users.get(newHostId)?.nickname });
    }

    socket.to(roomId).emit('user-left', { socketId: socket.id, nickname: socket.data.nickname, users: usersArray });
  };

  socket.on('leave-room', ({ roomId }) => { socket.leave(roomId); handleLeave(roomId); });
  socket.on('disconnect', () => handleLeave(socket.data.roomId));
};

export default registerRoomSocket;
export { activeRooms };
